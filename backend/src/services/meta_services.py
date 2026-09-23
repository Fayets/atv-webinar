"""Conversions API de Meta.

El navegador manda el evento por el pixel y el backend manda el mismo evento
por acá, los dos con el mismo `event_id`: así Meta los deduplica y cuenta uno
solo, pero si el navegador tiene bloqueador el server igual llega.
"""

import hashlib
import re
import time

import httpx
from decouple import config
from fastapi import HTTPException

GRAPH_VERSION = "v21.0"


def _hash(value: str | None) -> str | None:
    """Meta pide los datos personales en sha256, normalizados y en minúscula."""
    clean = (value or "").strip().lower()
    return hashlib.sha256(clean.encode("utf-8")).hexdigest() if clean else None


def _hash_phone(value: str | None) -> str | None:
    digits = re.sub(r"\D", "", value or "")
    return hashlib.sha256(digits.encode("utf-8")).hexdigest() if digits else None


class MetaServices:
    def pixel_id(self) -> str:
        return str(config("META_PIXEL_ID", default="")).strip()

    def _token(self) -> str:
        return str(config("META_CAPI_TOKEN", default="")).strip()

    def configured(self) -> bool:
        return bool(self.pixel_id() and self._token())

    async def send_event(
        self,
        *,
        event_name: str,
        event_id: str,
        event_source_url: str,
        email: str | None = None,
        phone: str | None = None,
        first_name: str | None = None,
        client_ip: str | None = None,
        user_agent: str | None = None,
        fbp: str | None = None,
        fbc: str | None = None,
        custom_data: dict | None = None,
    ) -> dict:
        if not self.configured():
            # Sin credenciales no es un error del visitante: se ignora en silencio.
            return {"ok": False, "skipped": "META_PIXEL_ID o META_CAPI_TOKEN sin configurar"}

        user_data: dict = {}
        if (em := _hash(email)):
            user_data["em"] = [em]
        if (ph := _hash_phone(phone)):
            user_data["ph"] = [ph]
        if (fn := _hash(first_name)):
            user_data["fn"] = [fn]
        if client_ip:
            user_data["client_ip_address"] = client_ip
        if user_agent:
            user_data["client_user_agent"] = user_agent
        if fbp:
            user_data["fbp"] = fbp
        if fbc:
            user_data["fbc"] = fbc

        event = {
            "event_name": event_name,
            "event_time": int(time.time()),
            "event_id": event_id,
            "action_source": "website",
            "event_source_url": event_source_url,
            "user_data": user_data,
        }
        if custom_data:
            event["custom_data"] = custom_data

        payload: dict = {"data": [event]}
        if (test_code := str(config("META_TEST_EVENT_CODE", default="")).strip()):
            payload["test_event_code"] = test_code

        url = f"https://graph.facebook.com/{GRAPH_VERSION}/{self.pixel_id()}/events"
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(
                    url, params={"access_token": self._token()}, json=payload
                )
        except httpx.HTTPError as error:
            raise HTTPException(status_code=502, detail=f"No se pudo hablar con Meta: {error}")

        body = response.json()
        print(f"[CAPI] {event_name} · {response.status_code} · {body}", flush=True)
        return body
