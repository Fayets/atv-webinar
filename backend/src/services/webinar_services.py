"""Configuración del webinar y armado de los links de calendario.

Todo sale del .env para que cambiar la fecha no requiera tocar código ni
recompilar el frontend.
"""

from datetime import datetime, timedelta, timezone
from urllib.parse import quote, urlencode
from zoneinfo import ZoneInfo

from decouple import config
from fastapi import HTTPException

from src.schemas import WebinarConfigResponse

AR = ZoneInfo("America/Argentina/Buenos_Aires")


class WebinarServices:
    def _starts_at(self) -> datetime:
        raw = config("WEBINAR_STARTS_AT", default="").strip()
        if not raw:
            raise HTTPException(
                status_code=503, detail="Falta configurar WEBINAR_STARTS_AT en el backend."
            )
        try:
            parsed = datetime.fromisoformat(raw)
        except ValueError:
            raise HTTPException(
                status_code=503,
                detail="WEBINAR_STARTS_AT no tiene formato ISO (ej: 2026-09-25T19:00:00-03:00).",
            )
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=AR)

    def get_config(self) -> WebinarConfigResponse:
        starts_at = self._starts_at()
        duration = config("WEBINAR_DURATION_MIN", default=90, cast=int)
        return WebinarConfigResponse(
            title=config("WEBINAR_TITLE", default="Webinar · Equipo A-players"),
            details=config("WEBINAR_DETAILS", default=""),
            location=config("WEBINAR_URL", default=""),
            starts_at=starts_at.isoformat(),
            ends_at=(starts_at + timedelta(minutes=duration)).isoformat(),
            duration_min=duration,
        )

    def _utc_stamps(self) -> tuple[str, str]:
        starts_at = self._starts_at().astimezone(timezone.utc)
        duration = config("WEBINAR_DURATION_MIN", default=90, cast=int)
        ends_at = starts_at + timedelta(minutes=duration)
        fmt = "%Y%m%dT%H%M%SZ"
        return starts_at.strftime(fmt), ends_at.strftime(fmt)

    def google_url(self) -> str:
        # Si hay un evento real de Google Calendar, manda a ese: ahí el lead
        # confirma asistencia y recibe la invitación con el link de la reunión.
        if (evento := str(config("WEBINAR_CALENDAR_URL", default="")).strip()):
            return evento

        start, end = self._utc_stamps()
        settings = self.get_config()
        params = {
            "action": "TEMPLATE",
            "text": settings.title,
            "dates": f"{start}/{end}",
            "details": settings.details,
            "location": settings.location,
        }
        # safe="/" deja el separador de `dates` sin escapar, que es como lo espera Google.
        return f"https://calendar.google.com/calendar/render?{urlencode(params, safe='/', quote_via=quote)}"

    def outlook_url(self) -> str:
        settings = self.get_config()
        params = {
            "path": "/calendar/action/compose",
            "rru": "addevent",
            "subject": settings.title,
            "startdt": settings.starts_at,
            "enddt": settings.ends_at,
            "body": settings.details,
            "location": settings.location,
        }
        return f"https://outlook.live.com/calendar/0/deeplink/compose?{urlencode(params, quote_via=quote)}"

    def ics(self) -> str:
        start, end = self._utc_stamps()
        settings = self.get_config()
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        # Los saltos de línea del .ics son CRLF por spec.
        lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Aumenta Tu Valor//Webinar//ES",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "BEGIN:VEVENT",
            f"UID:webinar-{start}@atvos.io",
            f"DTSTAMP:{stamp}",
            f"DTSTART:{start}",
            f"DTEND:{end}",
            f"SUMMARY:{settings.title}",
            f"DESCRIPTION:{settings.details}",
            f"LOCATION:{settings.location}",
            "BEGIN:VALARM",
            "TRIGGER:-PT30M",
            "ACTION:DISPLAY",
            "DESCRIPTION:Empieza en 30 minutos",
            "END:VALARM",
            "END:VEVENT",
            "END:VCALENDAR",
        ]
        return "\r\n".join(lines)
