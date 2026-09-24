from fastapi import APIRouter, Depends, HTTPException

from src.controllers.deps import require_access
from src.services.visits_services import VisitsServices

router = APIRouter()
service = VisitsServices()


@router.post("/", status_code=204)
def record_visit():
    try:
        service.record()
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al registrar el ingreso.")


@router.delete("/", status_code=204, dependencies=[Depends(require_access)])
def clear_visits():
    try:
        service.clear()
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al borrar los ingresos.")
