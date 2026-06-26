CATEGORY_KEYS = {
    "documents",
    "electronics",
    "clothing",
    "keys",
    "wallet",
    "bags",
    "pets",
    "other",
}

LEGACY_CATEGORY_TO_KEY = {
    "dokumenti": "documents",
    "documents": "documents",
    "documentos": "documents",
    "dokumente": "documents",
    "elektronika": "electronics",
    "electronics": "electronics",
    "electrónica": "electronics",
    "elektronik": "electronics",
    "odjeća": "clothing",
    "odjeÄ‡a": "clothing",
    "clothing": "clothing",
    "ropa": "clothing",
    "kleidung": "clothing",
    "ključevi": "keys",
    "kljuÄevi": "keys",
    "keys": "keys",
    "llaves": "keys",
    "schlüssel": "keys",
    "novčanik": "wallet",
    "novÄanik": "wallet",
    "wallet": "wallet",
    "cartera": "wallet",
    "geldbörse": "wallet",
    "torbe": "bags",
    "bags": "bags",
    "bolsos": "bags",
    "taschen": "bags",
    "kućni ljubimci": "pets",
    "kuÄ‡ni ljubimci": "pets",
    "pets": "pets",
    "mascotas": "pets",
    "haustiere": "pets",
    "ostalo": "other",
    "other": "other",
    "otro": "other",
    "sonstiges": "other",
}


def normalize_category_key(value: str) -> str:
    normalized = value.strip()
    if not normalized:
        return normalized

    lowered = normalized.lower()
    return LEGACY_CATEGORY_TO_KEY.get(lowered, normalized)
