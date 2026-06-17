from fastapi import FastAPI
from pathlib import Path
from controllers import auth_controller, user_controller, item_controller, claim_controller, admin_controller, upload_controller, notification_controller, websocket_controller, conversation_controller

from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from contextlib import asynccontextmanager
from app.database import engine

from fastapi.staticfiles import StaticFiles




def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

# -V7: dozvoljavamo lokalne dev origin-e (Vite=5173, CRA=3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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

app.include_router(websocket_controller.router)



@app.get("/")
def root():
    return {"message": "Backend radi"}