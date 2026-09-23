from fastapi import APIRouter, HTTPException

from src.schemas import VslConfigResponse
from src.services.vsl_services import VslServices

router = APIRouter()
service = VslServices()


@router.get("/", response_model=VslConfigResponse)
def get_vsl_config():
    try:
        return service.get_config()
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al obtener el VSL.")
