from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Lost & Found API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Lost & Found API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":

    uvicorn.run("main:app", host="localhost", port=8000, reload=True)

