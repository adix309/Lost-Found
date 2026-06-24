from fastapi import HTTPException, status, BackgroundTasks
from sqlmodel import Session
from html import escape
from core.config import settings
from repositories import (
    item_repository,
    match_notif_log_repository,
    item_match_repository,
    notification_repository,
    user_repository,
)
from models.notification_model import Notification, NotificationType
from models.item_model import Item, ItemType
from services.email_service import send_email
from models.user_model import User


EMAIL_ENABLED_NOTIFICATION_TYPES = {
    NotificationType.POTENTIAL_MATCH,
    NotificationType.SYSTEM_NOTIFICATION,
}


def _humanize_match_reasons(reasons: dict | list | None) -> list[str]:
    if not reasons:
        return []

    if isinstance(reasons, list):
        return [str(reason) for reason in reasons[:3]]

    if not isinstance(reasons, dict):
        return []

    reason_config = [
        ("title_score", "Sličan naslov", 0.55),
        ("title", "Sličan naslov", 0.55),
        ("description_score", "Sličan opis", 0.45),
        ("description", "Sličan opis", 0.45),
        ("brand_score", "Isti ili sličan brend", 0.70),
        ("brand", "Isti ili sličan brend", 0.70),
        ("color_score", "Slična boja", 0.65),
        ("color", "Slična boja", 0.65),
        ("category_score", "Ista kategorija", 0.80),
        ("category", "Ista kategorija", 0.80),
        ("location_score", "Slična lokacija", 0.55),
        ("location", "Slična lokacija", 0.55),
        ("location_name", "Slična lokacija", 0.55),
        ("date_score", "Blizak datum događaja", 0.50),
        ("date", "Blizak datum događaja", 0.50),
    ]

    readable_reasons: list[tuple[str, float]] = []

    for key, label, threshold in reason_config:
        raw_value = reasons.get(key)

        if raw_value is None:
            continue

        try:
            numeric_value = float(raw_value)
        except (TypeError, ValueError):
            continue

        if numeric_value >= threshold:
            readable_reasons.append((label, numeric_value))

    readable_reasons.sort(key=lambda item: item[1], reverse=True)

    unique_labels: list[str] = []
    seen = set()

    for label, _score in readable_reasons:
        if label not in seen:
            unique_labels.append(label)
            seen.add(label)

    return unique_labels[:3]


def _build_notification_email(
    notification_type: NotificationType,
    title: str,
    body: str,
    data: dict | None = None,
) -> tuple[str, str, str]:
    action_url = f"{settings.FRONTEND_URL}/notifications"

    if notification_type == NotificationType.POTENTIAL_MATCH:
        source_item_id = data.get("source_item_id") if data else None
        if source_item_id:
            action_url = f"{settings.FRONTEND_URL}/AllItems/{source_item_id}"

    subject = title

    text_body = f"""{title}

{body}

Pregledaj u aplikaciji:
{action_url}
"""

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2>{title}</h2>
        <p>{body}</p>
        <p>
          <a href="{action_url}" style="display:inline-block;padding:10px 16px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:8px;">
            Otvori aplikaciju
          </a>
        </p>
      </body>
    </html>
    """

    return subject, text_body, html_body


def _queue_notification_email(
    background_tasks: BackgroundTasks,
    user_email: str,
    notification_type: NotificationType,
    title: str,
    body: str,
    data: dict | None = None,
) -> None:
    subject, text_body, html_body = _build_notification_email(
        notification_type=notification_type,
        title=title,
        body=body,
        data=data,
    )

    background_tasks.add_task(
        send_email,
        user_email,
        subject,
        html_body,
        text_body,
    )


def create_notification(
    session: Session,
    user_id: int,
    type: NotificationType,
    title: str,
    body: str,
    data: dict | None = None,
    background_tasks: BackgroundTasks | None = None,
):
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        data=data,
    )
    notification = notification_repository.create(session, notification)

    user = user_repository.get_by_id(session, user_id)
    if (
        background_tasks
        and user
        and user.email
        and type in EMAIL_ENABLED_NOTIFICATION_TYPES
    ):
        _queue_notification_email(
            background_tasks=background_tasks,
            user_email=user.email,
            notification_type=type,
            title=title,
            body=body,
            data=data,
        )

    return notification


def _enrich_notification_matches(session: Session, notification: Notification) -> Notification:
    if notification and notification.type == NotificationType.POTENTIAL_MATCH and notification.data:
        source_item_id = notification.data.get("source_item_id")
        if source_item_id:
            source_item = item_repository.get_item_by_id(session, source_item_id)
            if source_item:
                top_matches = item_match_repository.list_top_matches_for_item(session, source_item_id, limit=3)
                match_previews = [
                    _serialize_match_preview(session, m, source_item)
                    for m in top_matches
                ]
                updated_data = dict(notification.data)
                updated_data["matches"] = match_previews
                if top_matches:
                    updated_data["best_score"] = top_matches[0].score
                notification.data = updated_data
    return notification


def list_my_notifications(session: Session, user_id: int, limit: int = 20, offset: int = 0):
    notifications = notification_repository.get_for_user(session, user_id=user_id, limit=limit, offset=offset)
    for n in notifications:
        _enrich_notification_matches(session, n)
    return notifications


def read_notification(session: Session, notification_id: int, user_id: int):
    notification = notification_repository.mark_as_read(session, notification_id, user_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notifikacija nije pronađena."
        )
    return _enrich_notification_matches(session, notification)


def broadcast_system_notification(
    session: Session,
    title: str,
    body: str,
    data: dict | None = None,
    background_tasks: BackgroundTasks | None = None,
) -> dict:
    users = user_repository.get_all_active(session)

    if not users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nema aktivnih korisnika za slanje notifikacije.",
        )

    notifications = [
        Notification(
            user_id=user.id,
            type=NotificationType.SYSTEM_NOTIFICATION,
            title=title,
            body=body,
            data=data,
        )
        for user in users
    ]

    session.add_all(notifications)
    session.commit()

    if background_tasks:
        for user in users:
            if user.email:
                _queue_notification_email(
                    background_tasks=background_tasks,
                    user_email=user.email,
                    notification_type=NotificationType.SYSTEM_NOTIFICATION,
                    title=title,
                    body=body,
                    data=data,
                )

    return {
        "sent_count": len(notifications),
        "message": "Sistemska notifikacija je uspješno poslana svim aktivnim korisnicima.",
    }


def _serialize_match_preview(session: Session, match, target_item: Item) -> dict:
    if target_item.item_type == ItemType.lost:
        counterpart_item_id = match.found_item_id
    else:
        counterpart_item_id = match.lost_item_id

    counterpart_item = item_repository.get_item_by_id(session, counterpart_item_id)

    # Determine if rank was improved
    rank_improved_val = (
        match.image_similarity_score is not None
        and match.final_score is not None
        and match.final_score > match.description_score
    )

    return {
        "match_id": match.id,
        "item_id": counterpart_item.id if counterpart_item else counterpart_item_id,
        "title": counterpart_item.title if counterpart_item else "Nepoznat predmet",
        "category": counterpart_item.category if counterpart_item else None,
        "location_name": counterpart_item.location_name if counterpart_item else None,
        "event_date": counterpart_item.event_date.isoformat() if counterpart_item and counterpart_item.event_date else None,
        "score": match.score,
        "reasons": _humanize_match_reasons(match.reasons),
        # Frontend-specific AI fields
        "description": counterpart_item.description if counterpart_item else None,
        "image_url": counterpart_item.image_url if counterpart_item else None,
        "description_score": match.description_score,
        "descriptionScore": match.description_score,
        "image_similarity_score": match.image_similarity_score,
        "imageSimilarityScore": match.image_similarity_score,
        "final_score": match.final_score,
        "finalScore": match.final_score,
        "used_image_reranking": match.used_image_reranking,
        "usedAiImageMatching": match.used_image_reranking,
        "rank_improved": rank_improved_val,
        "rankImproved": rank_improved_val,
    }


def notify_top_matches_for_item(
    session: Session,
    source_item: Item,
    matches: list,
    background_tasks: BackgroundTasks | None = None,
):
    if not matches:
        return

    grouped_matches_by_target_item_id: dict[int, list] = {}

    for match in matches:
        if source_item.item_type == ItemType.found:
            target_item_id = match.lost_item_id
        else:
            target_item_id = match.found_item_id

        grouped_matches_by_target_item_id.setdefault(target_item_id, []).append(match)

    for target_item_id, _relevant_matches in grouped_matches_by_target_item_id.items():
        target_item = item_repository.get_item_by_id(session, target_item_id)
        if not target_item:
            continue

        top_matches_for_target = item_match_repository.get_top_matches_for_item(
            session=session,
            item_id=target_item.id,
            item_type=target_item.item_type,
            limit=3,
        )

        if not top_matches_for_target:
            continue

        best_match = top_matches_for_target[0]

        already_notified_in_app = match_notif_log_repository.was_recently_notified(
            session,
            user_id=target_item.user_id,
            item_match_id=best_match.id,
            channel="in_app",
            within_hours=72,
        )

        already_notified_email = match_notif_log_repository.was_recently_notified(
            session,
            user_id=target_item.user_id,
            item_match_id=best_match.id,
            channel="email",
            within_hours=72,
        )

        match_previews = [
            _serialize_match_preview(session, match, target_item)
            for match in top_matches_for_target
        ]

        if not already_notified_in_app:
            create_notification(
                session=session,
                user_id=target_item.user_id,
                type=NotificationType.POTENTIAL_MATCH,
                title="Pronašli smo moguće poklapanje",
                body=f"Imamo do 3 potencijalna poklapanja za vaš predmet '{target_item.title}'.",
                data={
                    "source_item_id": target_item.id,
                    "source_item_title": target_item.title,
                    "best_score": best_match.score,
                    "matches": match_previews,
                },
                background_tasks=background_tasks,
            )

            match_notif_log_repository.create_notification_log(
                session,
                user_id=target_item.user_id,
                item_match_id=best_match.id,
                channel="in_app",
            )

        if target_item.user and target_item.user.email and not already_notified_email:
            try:
                subject, text_body, html_body = build_notification_email(
                    user=target_item.user,
                    notification_type=NotificationType.POTENTIAL_MATCH,
                    title="Pronašli smo moguće poklapanje",
                    message=f"Imamo do 3 potencijalna poklapanja za vaš predmet '{target_item.title}'.",
                    action_url=f"{settings.FRONTEND_URL}/items/{target_item.id}",
                    item_title=target_item.title,
                    item_location=target_item.location_name,
                    item_status_label="Aktivan",
                )

                print(
                    f"[EMAIL SEND] user_id={target_item.user_id} "
                    f"email={target_item.user.email} "
                    f"background_tasks={background_tasks is not None} "
                    f"match_id={best_match.id}"
                )

                if background_tasks is not None:
                    background_tasks.add_task(
                        send_email,
                        target_item.user.email,
                        subject,
                        html_body,
                        text_body,
                    )
                else:
                    send_email(
                        recipient=target_item.user.email,
                        subject=subject,
                        html_body=html_body,
                        text_body=text_body,
                    )

                match_notif_log_repository.create_notification_log(
                    session,
                    user_id=target_item.user_id,
                    item_match_id=best_match.id,
                    channel="email",
                )

            except Exception as exc:
                print(
                    f"[EMAIL ERROR] user_id={target_item.user_id} "
                    f"email={target_item.user.email} "
                    f"match_id={best_match.id} error={exc}"
                )


def build_notification_email(
    user: User,
    notification_type: NotificationType,
    title: str,
    message: str,
    action_url: str | None = None,
    item_title: str | None = None,
    item_location: str | None = None,
    item_status_label: str | None = None,
    actor_name: str | None = None,
) -> tuple[str, str, str]:
    subject_map = {
        NotificationType.POTENTIAL_MATCH: (
            f"Moguće poklapanje za oglas: {item_title}"
            if item_title else
            "Pronašli smo potencijalno poklapanje za vaš predmet"
        ),
        NotificationType.CONVERSATION_STARTED: (
            f"Novi razgovor za oglas: {item_title}"
            if item_title else
            "Započela je konverzacija o vašem predmetu"
        ),
    }

    subject = subject_map.get(notification_type, title)
    url = action_url or f"{settings.FRONTEND_URL}/notifications"

    safe_title = escape(title or "")
    safe_message = escape(message or "")
    safe_item_title = escape(item_title or "Nije navedeno")
    safe_item_location = escape(item_location or "Nije navedena")
    safe_item_status = escape(item_status_label or "Aktivan oglas")
    safe_actor_name = escape(actor_name or "Jedan korisnik")
    safe_user_name = escape(getattr(user, "full_name", None) or getattr(user, "username", None) or "korisniče")
    safe_url = escape(url)

    item_details_text = ""
    item_details_html = ""

    if item_title or item_location or item_status_label:
        item_details_text = f"""
Detalji oglasa:
- Naziv: {item_title or 'Nije navedeno'}
- Lokacija: {item_location or 'Nije navedena'}
- Status: {item_status_label or 'Aktivan oglas'}
"""

        item_details_html = f"""
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:20px 0;">
          <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">
            Detalji oglasa
          </div>
          <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:10px;">
            {safe_item_title}
          </div>
          <div style="font-size:14px;color:#374151;margin-bottom:6px;">
            <strong>Lokacija:</strong> {safe_item_location}
          </div>
          <div style="font-size:14px;color:#374151;">
            <strong>Status:</strong> {safe_item_status}
          </div>
        </div>
        """

    intro_text = f"Zdravo {safe_user_name},"
    intro_html = f"""
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
      Zdravo {safe_user_name},
    </p>
    """

    event_details_text = ""
    event_details_html = ""

    if notification_type == NotificationType.CONVERSATION_STARTED:
        event_details_text = f"""
Pokrenuo/la: {actor_name or 'Jedan korisnik'}
Radnja: Započet je novi razgovor u vezi s vašim oglasom.
"""
        event_details_html = f"""
        <div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:12px;padding:14px 16px;margin:0 0 20px;">
          <div style="font-size:14px;color:#164e63;">
            <strong>{safe_actor_name}</strong> je započeo/la novi razgovor u vezi s vašim oglasom.
          </div>
        </div>
        """

    elif notification_type == NotificationType.POTENTIAL_MATCH:
        event_details_text = """
Radnja: Sistem je pronašao moguće poklapanje za vaš oglas.
"""
        event_details_html = """
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 16px;margin:0 0 20px;">
          <div style="font-size:14px;color:#166534;">
            <strong>Pronašli smo moguće poklapanje</strong> za vaš oglas.
          </div>
        </div>
        """

    text_body = f"""{intro_text}

{title}

{message}
{event_details_text}
{item_details_text}
Otvorite: {url}

Ako dugme ili link ne rade, kopirajte ovaj link u preglednik:
{url}
"""

    html_body = f"""
    <html>
      <body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#0f766e 0%,#115e59 100%);">
                    <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#ccfbf1;margin-bottom:8px;">
                      Obavijest iz aplikacije
                    </div>
                    <h1 style="margin:0;font-size:24px;line-height:1.3;color:#ffffff;">
                      {safe_title}
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px 28px 8px;">
                    {intro_html}
                    <p style="margin:0 0 18px;font-size:15px;color:#374151;">
                      {safe_message}
                    </p>

                    {event_details_html}
                    {item_details_html}

                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0 12px;">
                      <tr>
                        <td align="center" bgcolor="#0f766e" style="border-radius:10px;">
                          <a href="{safe_url}" target="_blank" rel="noopener noreferrer"
                             style="display:inline-block;padding:12px 20px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                            Otvori oglas
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
                      Ako dugme ne radi, otvorite ovaj link:<br>
                      <a href="{safe_url}" target="_blank" rel="noopener noreferrer" style="color:#0f766e;text-decoration:none;">
                        {safe_url}
                      </a>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 28px 28px;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">
                      Ova poruka je poslana automatski kako biste na vrijeme vidjeli aktivnost vezanu za svoj oglas.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

    return subject, text_body, html_body