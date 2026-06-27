from fastapi import FastAPI
from pathlib import Path
from controllers import auth_controller, user_controller, item_controller, claim_controller, admin_controller, upload_controller, notification_controller, websocket_controller, conversation_controller,verification_question_controller

from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from contextlib import asynccontextmanager
from app.database import engine

from fastapi.staticfiles import StaticFiles


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    run_migrations()


def run_migrations():
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            dialect_name = conn.dialect.name
            if dialect_name == "postgresql":
                with engine.connect() as autocommit_conn:
                    autocommit_conn = autocommit_conn.execution_options(isolation_level="AUTOCOMMIT")
                    for val in ["under_verification", "approved", "handoff_pending", "completed", "cancelled"]:
                        try:
                            autocommit_conn.execute(text(f"ALTER TYPE claimstatus ADD VALUE '{val}';"))
                        except Exception:
                            pass

                conn.execute(text("ALTER TABLE item_images ADD COLUMN IF NOT EXISTS embedding_status VARCHAR DEFAULT 'pending';"))
                conn.execute(text("ALTER TABLE item_images ADD COLUMN IF NOT EXISTS embedding_model VARCHAR;"))
                conn.execute(text("ALTER TABLE item_images ADD COLUMN IF NOT EXISTS embedding_vector JSONB;"))
                conn.execute(text("ALTER TABLE item_images ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))

                conn.execute(text("ALTER TABLE item_matches ADD COLUMN IF NOT EXISTS image_similarity_score DOUBLE PRECISION;"))
                conn.execute(text("ALTER TABLE item_matches ADD COLUMN IF NOT EXISTS final_score DOUBLE PRECISION;"))
                conn.execute(text("ALTER TABLE item_matches ADD COLUMN IF NOT EXISTS used_image_reranking BOOLEAN DEFAULT FALSE;"))

                
                conn.execute(text("ALTER TABLE claims ADD COLUMN IF NOT EXISTS lost_item_id INTEGER REFERENCES items(id) ON DELETE SET NULL;"))
                conn.execute(text("ALTER TABLE claims ADD COLUMN IF NOT EXISTS claimer_confirmed_handoff BOOLEAN DEFAULT FALSE;"))
                conn.execute(text("ALTER TABLE claims ADD COLUMN IF NOT EXISTS owner_confirmed_handoff BOOLEAN DEFAULT FALSE;"))
                conn.execute(text("ALTER TABLE claims ADD COLUMN IF NOT EXISTS verification_answers JSONB;"))
                conn.execute(text("ALTER TABLE claims ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;"))

                conn.commit()
                print("[MIGRATION] PostgreSQL tables updated successfully.")
    except Exception as e:
        print(f"[MIGRATION] Migration error: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

# -V7: dozvoljavamo lokalne dev origin-e (Vite=5173, CRA=3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Path("media").mkdir(parents=True, exist_ok=True)

app.mount("/media", StaticFiles(directory="media"), name="media")

app.include_router(auth_controller.router, prefix="/auth" , tags=["Auth"])
app.include_router(user_controller.router, prefix="/users", tags=["Users"])
app.include_router(item_controller.router, prefix="/items", tags=["Items"])
app.include_router(admin_controller.router, prefix="/admin", tags=["Admin"])
app.include_router(notification_controller.router, prefix="/notifications", tags=["Notifications"])
app.include_router(claim_controller.router, tags=["Claims"])

app.include_router(upload_controller.router, prefix="/uploads", tags=["uploads"])
app.include_router(conversation_controller.router, prefix="/conversations", tags=["Conversations"])
app.include_router(verification_question_controller.router,prefix="/verification-questions",tags=["Verification Questions"])


app.include_router(websocket_controller.router)



@app.get("/")
def root():
    return {"message": "Backend radi"}