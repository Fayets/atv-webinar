from fastapi import APIRouter, HTTPException

from src.schemas import WebinarConfigResponse
from src.services.webinar_services import WebinarServices

router = APIRouter()
service = WebinarServices()


@router.get("/", response_model=WebinarConfigResponse)
def get_webinar():
    try:
        return service.get_config()
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al leer la fecha del webinar.")
