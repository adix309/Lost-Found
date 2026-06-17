from datetime import datetime
from difflib import SequenceMatcher
from math import radians, sin, cos, sqrt, atan2
from models.item_model import Item



def normalize_text(value: str | None) -> str:
    return (value or "").strip().lower()


def text_similarity(a: str | None, b: str | None) -> float:
    a = normalize_text(a)
    b = normalize_text(b)

    if not a or not b:
        return 0.0

    return SequenceMatcher(None, a, b).ratio()


def exact_or_soft_match(a: str | None, b: str | None) -> float:
    a = normalize_text(a)
    b = normalize_text(b)

    if not a or not b:
        return 0.0

    if a == b:
        return 1.0

    return text_similarity(a, b)


def date_proximity_score(a: datetime, b: datetime) -> float:
    days = abs((a - b).total_seconds()) / 86400
    if days <= 1:
        return 1.0
    if days <= 3:
        return 0.85
    if days <= 7:
        return 0.65
    if days <= 14:
        return 0.4
    if days <= 30:
        return 0.2
    return 0.0


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    r = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return r * c


def location_score(item_a, item_b) -> float:
    if (
        item_a.latitude is not None and item_a.longitude is not None and
        item_b.latitude is not None and item_b.longitude is not None
    ):
        km = haversine_km(item_a.latitude, item_a.longitude, item_b.latitude, item_b.longitude)
        if km <= 0.2:
            return 1.0
        if km <= 1:
            return 0.8
        if km <= 3:
            return 0.5
        if km <= 10:
            return 0.2
        return 0.0

    return text_similarity(item_a.location_name, item_b.location_name)


def calculate_match_score(item_a: Item, item_b: Item) -> dict:
    title_score = text_similarity(item_a.title, item_b.title)
    description_score = text_similarity(item_a.description, item_b.description)
    brand_score = exact_or_soft_match(item_a.brand, item_b.brand)
    color_score = exact_or_soft_match(item_a.color, item_b.color)
    category_score = 1.0 if normalize_text(item_a.category) == normalize_text(item_b.category) else 0.0
    loc_score = location_score(item_a, item_b)
    dt_score = date_proximity_score(item_a.event_date, item_b.event_date)

    final_score = (
        category_score * 0.15 +
        title_score * 0.25 +
        description_score * 0.20 +
        brand_score * 0.10 +
        color_score * 0.05 +
        loc_score * 0.15 +
        dt_score * 0.10
    )

    reasons = {
        "category_match": category_score > 0.0,
        "title_similarity": round(title_score, 3),
        "description_similarity": round(description_score, 3),
        "brand_similarity": round(brand_score, 3),
        "color_similarity": round(color_score, 3),
        "location_similarity": round(loc_score, 3),
        "date_similarity": round(dt_score, 3),
    }

    return {
        "score": round(final_score, 4),
        "title_score": round(title_score, 4),
        "description_score": round(description_score, 4),
        "brand_score": round(brand_score, 4),
        "color_score": round(color_score, 4),
        "category_score": round(category_score, 4),
        "location_score": round(loc_score, 4),
        "date_score": round(dt_score, 4),
        "reasons": reasons,
    }