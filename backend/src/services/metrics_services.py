from collections import Counter
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from pony.orm import db_session

from src.models import Lead, PageView
from src.schemas import BreakdownItem, DailyItem, MetricsResponse
from src.services.leads_services import _load

AR = ZoneInfo("America/Argentina/Buenos_Aires")
DAYS = 14

_AREA_FIELDS = {
    "Marketing": "bottleneck_marketing",
    "Ventas": "bottleneck_ventas",
    "Producto": "bottleneck_producto",
}


def _local_date(value: datetime) -> str:
    stamped = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    return stamped.astimezone(AR).date().isoformat()


def _rate(part: int, total: int) -> float:
    return round(part / total * 100, 1) if total else 0.0


def _breakdown(counter: Counter, limit: int | None = None) -> list[BreakdownItem]:
    items = counter.most_common(limit)
    return [BreakdownItem(label=label, value=value) for label, value in items]


class MetricsServices:
    def get_metrics(self) -> MetricsResponse:
        with db_session:
            result = Lead.select()[:]
            leads = [result[i] for i in range(len(result))]

            visitas = PageView.select().count()
            total = len(leads)
            completos = sum(1 for lead in leads if lead.avatar)
            calificados = sum(1 for lead in leads if lead.calificado is True)
            no_calificados = sum(1 for lead in leads if lead.calificado is False)
            contactados = sum(1 for lead in leads if lead.contacted)
            whatsapp_clicks = sum(lead.wa_clicks for lead in leads)
            whatsapp_leads = sum(1 for lead in leads if lead.wa_clicks > 0)
            calendar_clicks = sum(lead.calendar_clicks for lead in leads)
            calendar_leads = sum(1 for lead in leads if lead.calendar_clicks > 0)

            avatars = Counter(lead.avatar for lead in leads if lead.avatar)
            revenues = Counter(lead.revenue for lead in leads if lead.revenue)

            areas = Counter()
            obstaculos = Counter()
            for lead in leads:
                for area in _load(lead.bottleneck_areas):
                    areas[area] += 1
                for field in _AREA_FIELDS.values():
                    for item in _load(getattr(lead, field)):
                        obstaculos[item] += 1

            registros_por_dia = Counter(_local_date(lead.created_at) for lead in leads)
            whatsapp_por_dia = Counter(
                _local_date(lead.wa_first_click_at)
                for lead in leads
                if lead.wa_first_click_at is not None
            )
            calendar_por_dia = Counter(
                _local_date(lead.calendar_first_click_at)
                for lead in leads
                if lead.calendar_first_click_at is not None
            )

        hoy = datetime.now(AR).date()
        por_dia = []
        for offset in range(DAYS - 1, -1, -1):
            day = (hoy - timedelta(days=offset)).isoformat()
            por_dia.append(
                DailyItem(
                    date=day,
                    total=registros_por_dia.get(day, 0),
                    whatsapp=whatsapp_por_dia.get(day, 0),
                    calendar=calendar_por_dia.get(day, 0),
                )
            )

        return MetricsResponse(
            visitas=visitas,
            total=total,
            completos=completos,
            solo_datos=total - completos,
            calificados=calificados,
            no_calificados=no_calificados,
            contactados=contactados,
            pendientes=total - contactados,
            whatsapp_clicks=whatsapp_clicks,
            whatsapp_leads=whatsapp_leads,
            whatsapp_rate=_rate(whatsapp_leads, total),
            calendar_clicks=calendar_clicks,
            calendar_leads=calendar_leads,
            calendar_rate=_rate(calendar_leads, total),
            contacto_rate=_rate(contactados, total),
            por_dia=por_dia,
            por_avatar=_breakdown(avatars),
            por_revenue=_breakdown(revenues),
            por_area=_breakdown(areas),
            top_obstaculos=_breakdown(obstaculos, limit=6),
        )
