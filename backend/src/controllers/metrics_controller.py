from fastapi import APIRouter, Depends, HTTPException

from src.controllers.deps import require_access
from src.schemas import MetricsResponse
from src.services.metrics_services import MetricsServices

router = APIRouter()
service = MetricsServices()


@router.get("/", response_model=MetricsResponse, dependencies=[Depends(require_access)])
def get_metrics():
    try:
        return service.get_metrics()
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al calcular las métricas.")
