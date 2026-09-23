from datetime import datetime

from pony.orm import Optional, PrimaryKey, Required

from src.db import LEAD_TABLE, db


class Lead(db.Entity):
    _table_ = LEAD_TABLE

    id = PrimaryKey(int, auto=True)
    nombre = Required(str)
    email = Required(str, unique=True)
    telefono = Optional(str, nullable=True)
    instagram = Optional(str, nullable=True)

    # Respuestas del quiz. Las listas se guardan serializadas como JSON.
    avatar = Optional(str, nullable=True)
    revenue = Optional(str, nullable=True)
    bottleneck_areas = Optional(str, nullable=True)
    bottleneck_marketing = Optional(str, nullable=True)
    bottleneck_ventas = Optional(str, nullable=True)
    bottleneck_producto = Optional(str, nullable=True)
    calificado = Optional(bool, nullable=True)

    # Gestión interna desde el dashboard.
    contacted = Required(bool, default=False)
    responsable = Optional(str, nullable=True)
    notes = Optional(str, nullable=True)

    # Botón de WhatsApp. Contamos clicks: WhatsApp no informa quién entra al grupo.
    wa_clicks = Required(int, default=0)
    wa_first_click_at = Optional(datetime, nullable=True)
    wa_last_click_at = Optional(datetime, nullable=True)

    # Botón de "agregar el webinar a mi calendario". Mismo criterio: son clicks.
    calendar_clicks = Required(int, default=0)
    calendar_first_click_at = Optional(datetime, nullable=True)
    calendar_last_click_at = Optional(datetime, nullable=True)

    utm_source = Optional(str, nullable=True)
    utm_medium = Optional(str, nullable=True)
    utm_campaign = Optional(str, nullable=True)
    created_at = Required(datetime, default=datetime.utcnow)
