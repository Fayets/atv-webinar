from decouple import config
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, Response

from src.controllers.deps import require_access
from src.schemas import LeadCreate, LeadResponse, LeadUpdate
from src.services.leads_services import LeadsServices
from src.services.webinar_services import WebinarServices

router = APIRouter()
service = LeadsServices()
webinar = WebinarServices()


@router.post("/", response_model=LeadResponse, status_code=201)
def create_lead(payload: LeadCreate):
    try:
        return service.create_lead(payload)
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al registrar el lead.")


@router.get("/", response_model=list[LeadResponse], dependencies=[Depends(require_access)])
def list_leads():
    try:
        return service.list_leads()
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al listar leads.")


@router.get("/{lead_id}/whatsapp")
def go_to_whatsapp(lead_id: int):
    """Cuenta el click y manda al grupo. El salto es server-side para que el
    registro no dependa de que el browser alcance a disparar un fetch."""
    try:
        service.register_whatsapp_click(lead_id)
        group_url = config("WHATSAPP_GROUP_URL", default="")
        if not group_url:
            raise HTTPException(
                status_code=503,
                detail="Falta configurar WHATSAPP_GROUP_URL en el backend.",
            )
        return RedirectResponse(url=group_url, status_code=303)
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al abrir WhatsApp.")


@router.get("/{lead_id}/calendar")
def add_to_calendar(lead_id: int, provider: str = "google"):
    """Cuenta el click y manda al calendario elegido. Igual que WhatsApp, el
    salto es server-side para no perder el registro."""
    try:
        service.register_calendar_click(lead_id)

        if provider == "ics":
            return Response(
                content=webinar.ics(),
                media_type="text/calendar; charset=utf-8",
                headers={"Content-Disposition": 'attachment; filename="webinar-atv.ics"'},
            )
        if provider == "outlook":
            return RedirectResponse(url=webinar.outlook_url(), status_code=303)
        return RedirectResponse(url=webinar.google_url(), status_code=303)
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al abrir el calendario.")


@router.patch("/{lead_id}", response_model=LeadResponse, dependencies=[Depends(require_access)])
def update_lead(lead_id: int, payload: LeadUpdate):
    try:
        return service.update_lead(lead_id, payload)
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al actualizar el lead.")


@router.delete("/{lead_id}", dependencies=[Depends(require_access)])
def delete_lead(lead_id: int):
    try:
        return service.delete_lead(lead_id)
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al eliminar el lead.")
