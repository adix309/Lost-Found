from sqlmodel import Session
from core.matching_utils import calculate_match_score
from models.item_model import Item, ItemStatus, ItemType
from repositories import item_repository, item_match_repository, match_notif_log_repository
from services.notification_service import notify_top_matches_for_item
from fastapi import BackgroundTasks
from sqlmodel import Session

from app.database import engine
from repositories import candidate_repository


HIGH_THRESHOLD = 0.85
MEDIUM_THRESHOLD = 0.70
TOP_K = 3


def get_lost_and_found_pair(source_item: Item, candidate_item: Item) -> tuple[Item, Item]:
    if source_item.item_type == ItemType.lost:
        return source_item, candidate_item
    return candidate_item, source_item


def run_item_matching(
    session: Session,
    source_item: Item,
    background_tasks: BackgroundTasks | None = None,
) -> list:
    candidates = candidate_repository.get_candidate_items_for_matching(session, source_item, limit=50)

    passed_candidates = []
    for candidate in candidates:
        score_data = calculate_match_score(source_item, candidate)
        print(
            f"[MATCH STAGE 1] source={source_item.id} candidate={candidate.id} "
            f"title={candidate.title} score={score_data.get('score')} "
        )
        if score_data["score"] < 0.45:
            continue
        
        passed_candidates.append({
            "candidate": candidate,
            "description_score": score_data["score"],
            "score_data": score_data
        })

    from services.match_reranking_service import match_reranking_service
    reranked = match_reranking_service.rerank_matches(session, source_item, passed_candidates)

    scored = []
    for r in reranked:
        candidate = r["candidate"]
        score_data = r["score_data"]
        
        lost_item, found_item = get_lost_and_found_pair(source_item, candidate)
        match = item_match_repository.upsert_match(
            session,
            lost_item_id=lost_item.id,
            found_item_id=found_item.id,
            score_data=score_data,
        )
        scored.append(match)

    scored.sort(key=lambda x: x.score, reverse=True)
    top_matches = scored[:TOP_K]

    if top_matches:
        notify_top_matches_for_item(session, source_item, top_matches, background_tasks)

    return top_matches



def run_item_matching_job(item_id: int):
    print(f"[MATCH JOB] start item_id={item_id}")

    with Session(engine) as session:
        item = item_repository.get_item_by_id(session, item_id)
        print(f"[MATCH JOB] loaded item={item.id if item else None}")

        if item is None:
            print("[MATCH JOB] item not found")
            return

        if item.status != ItemStatus.active:
            print(f"[MATCH JOB] item not active: {item.status}")
            return

        run_item_matching(session, item)
        print(f"[MATCH JOB] done item_id={item_id}")