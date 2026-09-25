from contextlib import asynccontextmanager

from decouple import config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.controllers.auth_controller import router as auth_router
from src.controllers.leads_controller import router as leads_router
from src.controllers.metrics_controller import router as metrics_router
from src.controllers.visits_controller import router as visits_router
from src.controllers.vsl_controller import router as vsl_router
from src.controllers.webinar_controller import router as webinar_router
from src.db import init_db


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Landing Webinar", lifespan=lifespan)

# En producción el frontend se sirve desde el mismo origen (join.atvos.io) por nginx,
# así que CORS solo hace falta para el dev server de Vite.
frontend_origins = [
    origin.strip()
    for origin in config("FRONTEND_ORIGIN", default="http://localhost:5174").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(leads_router, prefix="/api/leads", tags=["leads"])
app.include_router(metrics_router, prefix="/api/metrics", tags=["metrics"])
app.include_router(visits_router, prefix="/api/visits", tags=["visits"])
app.include_router(vsl_router, prefix="/api/vsl", tags=["vsl"])
app.include_router(webinar_router, prefix="/api/webinar", tags=["webinar"])


@app.get("/health")
def health():
    return {"ok": True}
