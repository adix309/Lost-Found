from datetime import datetime, timedelta
from sqlmodel import Session, select

from app.database import engine  # prilagodi ako ti je engine negdje drugo
from models.user_model import User
from models.item_model import Item, ItemType, ItemStatus
from models.claim_model import Claim


def seed_data():
    with Session(engine) as session:
        # Da ne duplira korisnike ako pokreneš više puta
        existing_user = session.exec(
            select(User).where(User.email == "test.user@example.com")
        ).first()

        if existing_user:
            user = existing_user
        else:
            user = User(
                username="testuser",
                first_name="Test",
                last_name="User",
                email="test.user@example.com",
                phone="+38761111222",
                profile_image=None,
                is_active=True,
                hashed_password="fake_hashed_password_for_testing",
                is_admin=False,
            )

            session.add(user)
            session.commit()
            session.refresh(user)

        items = [
            Item(
                user_id=user.id,
                title="Izgubljen crni novčanik",
                description="Crni kožni novčanik izgubljen u blizini SCC-a u Sarajevu.",
                item_type=ItemType.lost,
                category="Novčanik",
                location_name="Sarajevo - SCC",
                latitude=43.8559,
                longitude=18.4078,
                event_date=datetime.utcnow() - timedelta(days=1),
                image_url=None,
                brand="Tommy Hilfiger",
                color="Crna",
                reward_amount=50.0,
                contact_phone="+38761111222",
                contact_email="test.user@example.com",
                hidden_unique_features='{"inside": "studentska kartica", "initials": "A.K."}',
                status=ItemStatus.active,
            ),
            Item(
                user_id=user.id,
                title="Pronađeni ključevi",
                description="Pronađen svežanj ključeva sa plavim privjeskom kod autobuske stanice.",
                item_type=ItemType.found,
                category="Ključevi",
                location_name="Zenica - Autobuska stanica",
                latitude=44.2034,
                longitude=17.9077,
                event_date=datetime.utcnow() - timedelta(days=2),
                image_url=None,
                brand=None,
                color="Srebrna",
                reward_amount=None,
                contact_phone="+38761111222",
                contact_email="test.user@example.com",
                hidden_unique_features='{"key_count": 4, "keychain": "plavi privjesak"}',
                status=ItemStatus.active,
            ),
            Item(
                user_id=user.id,
                title="Izgubljen iPhone",
                description="Bijeli iPhone izgubljen u Starom gradu u Mostaru.",
                item_type=ItemType.lost,
                category="Mobitel",
                location_name="Mostar - Stari most",
                latitude=43.3373,
                longitude=17.8150,
                event_date=datetime.utcnow() - timedelta(days=3),
                image_url=None,
                brand="Apple",
                color="Bijela",
                reward_amount=100.0,
                contact_phone="+38761111222",
                contact_email="test.user@example.com",
                hidden_unique_features='{"case": "transparentna maska", "wallpaper": "planina"}',
                status=ItemStatus.active,
            ),
            Item(
                user_id=user.id,
                title="Pronađena studentska kartica",
                description="Studentska kartica pronađena ispred fakulteta.",
                item_type=ItemType.found,
                category="Dokumenti",
                location_name="Tuzla - Univerzitet",
                latitude=44.5375,
                longitude=18.6735,
                event_date=datetime.utcnow() - timedelta(days=1),
                image_url=None,
                brand=None,
                color=None,
                reward_amount=None,
                contact_phone="+38761111222",
                contact_email="test.user@example.com",
                hidden_unique_features='{"document_type": "studentska kartica"}',
                status=ItemStatus.active,
            ),
            Item(
                user_id=user.id,
                title="Izgubljen sivi ruksak",
                description="Sivi ruksak izgubljen u blizini Kastela.",
                item_type=ItemType.lost,
                category="Torba",
                location_name="Banja Luka - Kastel",
                latitude=44.7722,
                longitude=17.1910,
                event_date=datetime.utcnow() - timedelta(days=4),
                image_url=None,
                brand="Nike",
                color="Siva",
                reward_amount=70.0,
                contact_phone="+38761111222",
                contact_email="test.user@example.com",
                hidden_unique_features='{"inside": "punjač za laptop i sveska"}',
                status=ItemStatus.active,
            ),
            Item(
                user_id=user.id,
                title="Pronađene naočale",
                description="Pronađene dioptrijske naočale na klupi u parku.",
                item_type=ItemType.found,
                category="Naočale",
                location_name="Bihać - Gradski park",
                latitude=44.8167,
                longitude=15.8708,
                event_date=datetime.utcnow() - timedelta(days=5),
                image_url=None,
                brand="Ray-Ban",
                color="Crna",
                reward_amount=None,
                contact_phone="+38761111222",
                contact_email="test.user@example.com",
                hidden_unique_features='{"case": "bez futrole", "frame": "crni okvir"}',
                status=ItemStatus.active,
            ),
            Item(
                user_id=user.id,
                title="Izgubljen sat",
                description="Ručni sat izgubljen u centru Travnika.",
                item_type=ItemType.lost,
                category="Sat",
                location_name="Travnik - Centar",
                latitude=44.2264,
                longitude=17.6658,
                event_date=datetime.utcnow() - timedelta(days=2),
                image_url=None,
                brand="Casio",
                color="Crna",
                reward_amount=40.0,
                contact_phone="+38761111222",
                contact_email="test.user@example.com",
                hidden_unique_features='{"strap": "gumeni kaiš", "scratch": "ogrebotina na staklu"}',
                status=ItemStatus.active,
            ),
            Item(
                user_id=user.id,
                title="Pronađena jakna",
                description="Crna jakna pronađena u kafiću u centru Doboja.",
                item_type=ItemType.found,
                category="Odjeća",
                location_name="Doboj - Centar",
                latitude=44.7318,
                longitude=18.0869,
                event_date=datetime.utcnow() - timedelta(days=6),
                image_url=None,
                brand="Zara",
                color="Crna",
                reward_amount=None,
                contact_phone="+38761111222",
                contact_email="test.user@example.com",
                hidden_unique_features='{"pocket": "račun u unutrašnjem džepu"}',
                status=ItemStatus.active,
            ),
        ]

        session.add_all(items)
        session.commit()

        print(f"Seed završio. Dodano itema: {len(items)}")


if __name__ == "__main__":
    seed_data()