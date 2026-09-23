import json
from datetime import datetime

from fastapi import HTTPException
from pony.orm import db_session, desc, flush

from src.models import Lead
from src.quiz import is_qualified
from src.schemas import LeadCreate, LeadResponse, LeadUpdate


def _dump(values: list[str] | None) -> str | None:
    return json.dumps(values, ensure_ascii=False) if values else None


def _load(raw: str | None) -> list[str]:
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
    except ValueError:
        return []
    return parsed if isinstance(parsed, list) else []


def _to_response(lead: Lead) -> LeadResponse:
    return LeadResponse(
        id=lead.id,
        nombre=lead.nombre,
        email=lead.email,
        telefono=lead.telefono,
        instagram=lead.instagram,
        avatar=lead.avatar,
        revenue=lead.revenue,
        bottleneck_areas=_load(lead.bottleneck_areas),
        bottleneck_marketing=_load(lead.bottleneck_marketing),
        bottleneck_ventas=_load(lead.bottleneck_ventas),
        bottleneck_producto=_load(lead.bottleneck_producto),
        calificado=lead.calificado,
        contacted=lead.contacted,
        responsable=lead.responsable,
        notes=lead.notes,
        wa_clicks=lead.wa_clicks,
        wa_first_click_at=lead.wa_first_click_at,
        wa_last_click_at=lead.wa_last_click_at,
        calendar_clicks=lead.calendar_clicks,
        calendar_first_click_at=lead.calendar_first_click_at,
        calendar_last_click_at=lead.calendar_last_click_at,
        utm_source=lead.utm_source,
        utm_medium=lead.utm_medium,
        utm_campaign=lead.utm_campaign,
        created_at=lead.created_at,
    )


class LeadsServices:
    def create_lead(self, payload: LeadCreate) -> LeadResponse:
        with db_session:
            email = payload.email.lower().strip()
            fields = {
                "nombre": payload.nombre.strip(),
                "telefono": payload.telefono.strip() if payload.telefono else None,
                "instagram": payload.instagram.strip().lstrip("@") if payload.instagram else None,
                "avatar": payload.avatar,
                "revenue": payload.revenue,
                "bottleneck_areas": _dump(payload.bottleneck_areas),
                "bottleneck_marketing": _dump(payload.bottleneck_marketing),
                "bottleneck_ventas": _dump(payload.bottleneck_ventas),
                "bottleneck_producto": _dump(payload.bottleneck_producto),
                "calificado": is_qualified(payload.avatar, payload.revenue),
                "utm_source": payload.utm_source,
                "utm_medium": payload.utm_medium,
                "utm_campaign": payload.utm_campaign,
            }

            # Si vuelve a completar el quiz con el mismo email, actualizamos sus
            # respuestas en vez de rebotarlo con un 409 y dejarlo sin WhatsApp.
            lead = Lead.get(email=email)
            if lead:
                lead.set(**fields)
            else:
                lead = Lead(email=email, **fields)
            flush()

            return _to_response(lead)

    def list_leads(self) -> list[LeadResponse]:
        with db_session:
            result = Lead.select().order_by(desc(Lead.created_at))[:]
            return [_to_response(result[i]) for i in range(len(result))]

    def get_lead(self, lead_id: int) -> LeadResponse:
        with db_session:
            lead = Lead.get(id=lead_id)
            if not lead:
                raise HTTPException(status_code=404, detail="Registro no encontrado.")
            return _to_response(lead)

    def update_lead(self, lead_id: int, payload: LeadUpdate) -> LeadResponse:
        with db_session:
            lead = Lead.get(id=lead_id)
            if not lead:
                raise HTTPException(status_code=404, detail="Registro no encontrado.")

            changes = payload.model_dump(exclude_unset=True)
            if changes:
                lead.set(**changes)
            flush()
            return _to_response(lead)

    def delete_lead(self, lead_id: int) -> dict:
        with db_session:
            lead = Lead.get(id=lead_id)
            if not lead:
                raise HTTPException(status_code=404, detail="Registro no encontrado.")
            lead.delete()
            return {"ok": True}

    def _register_click(self, lead_id: int, prefix: str) -> None:
        with db_session:
            lead = Lead.get(id=lead_id)
            if not lead:
                raise HTTPException(status_code=404, detail="Registro no encontrado.")

            now = datetime.utcnow()
            setattr(lead, f"{prefix}_clicks", getattr(lead, f"{prefix}_clicks") + 1)
            if getattr(lead, f"{prefix}_first_click_at") is None:
                setattr(lead, f"{prefix}_first_click_at", now)
            setattr(lead, f"{prefix}_last_click_at", now)

    def register_whatsapp_click(self, lead_id: int) -> None:
        """Marca que el lead tocó el botón del grupo.

        Es un click, no un ingreso confirmado: WhatsApp no expone quién entra a
        un grupo desde un link de invitación.
        """
        self._register_click(lead_id, "wa")

    def register_calendar_click(self, lead_id: int) -> None:
        """Marca que el lead se llevó el webinar a su calendario.

        Tampoco es confirmación: sabemos que abrió el link, no que lo guardó.
        """
        self._register_click(lead_id, "calendar")
