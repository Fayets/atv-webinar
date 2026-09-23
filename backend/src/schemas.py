from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class LeadCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    telefono: str | None = Field(default=None, max_length=40)
    instagram: str | None = Field(default=None, max_length=120)

    avatar: str | None = Field(default=None, max_length=160)
    revenue: str | None = Field(default=None, max_length=60)
    bottleneck_areas: list[str] = Field(default_factory=list)
    bottleneck_marketing: list[str] = Field(default_factory=list)
    bottleneck_ventas: list[str] = Field(default_factory=list)
    bottleneck_producto: list[str] = Field(default_factory=list)

    utm_source: str | None = None
    utm_medium: str | None = None
    utm_campaign: str | None = None


class LeadUpdate(BaseModel):
    contacted: bool | None = None
    responsable: str | None = Field(default=None, max_length=60)
    notes: str | None = None
    calificado: bool | None = None


class LeadResponse(BaseModel):
    id: int
    nombre: str
    email: str
    telefono: str | None = None
    instagram: str | None = None

    avatar: str | None = None
    revenue: str | None = None
    bottleneck_areas: list[str] = Field(default_factory=list)
    bottleneck_marketing: list[str] = Field(default_factory=list)
    bottleneck_ventas: list[str] = Field(default_factory=list)
    bottleneck_producto: list[str] = Field(default_factory=list)
    calificado: bool | None = None

    contacted: bool = False
    responsable: str | None = None
    notes: str | None = None

    wa_clicks: int = 0
    wa_first_click_at: datetime | None = None
    wa_last_click_at: datetime | None = None

    calendar_clicks: int = 0
    calendar_first_click_at: datetime | None = None
    calendar_last_click_at: datetime | None = None

    utm_source: str | None = None
    utm_medium: str | None = None
    utm_campaign: str | None = None
    created_at: datetime


class BreakdownItem(BaseModel):
    label: str
    value: int


class DailyItem(BaseModel):
    date: str
    total: int
    whatsapp: int
    calendar: int


class MetricsResponse(BaseModel):
    total: int
    completos: int
    solo_datos: int
    calificados: int
    no_calificados: int
    contactados: int
    pendientes: int
    whatsapp_clicks: int
    whatsapp_leads: int
    whatsapp_rate: float
    calendar_clicks: int
    calendar_leads: int
    calendar_rate: float
    contacto_rate: float
    por_dia: list[DailyItem]
    por_avatar: list[BreakdownItem]
    por_revenue: list[BreakdownItem]
    por_area: list[BreakdownItem]
    top_obstaculos: list[BreakdownItem]


class PinRequest(BaseModel):
    pin: str


class PinResponse(BaseModel):
    ok: bool


class SessionResponse(BaseModel):
    username: str


class AuthModeResponse(BaseModel):
    mode: str


class WebinarConfigResponse(BaseModel):
    title: str
    details: str
    location: str
    starts_at: str
    ends_at: str
    duration_min: int


class VslConfigResponse(BaseModel):
    url: str
    vimeo_id: str
    embed_src: str
