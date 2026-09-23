"""Acceso al dashboard.

En producción manda la sesión del ecosistema: la cookie `ecosystem_session` la
firma atv-ecosystem con HMAC sobre `SECRET`, así que alcanza con compartir esa
variable para validarla acá, sin consultar a nadie.

Si no hay `SECRET` configurado (desarrollo local) se cae al PIN.
"""

import base64
import hashlib
import hmac
import json
import time

from decouple import config
from fastapi import HTTPException

SESSION_COOKIE_NAME = "ecosystem_session"


class AuthServices:
    def _secret(self) -> str:
        return str(config("SECRET", default="")).strip()

    def mode(self) -> str:
        return "session" if self._secret() else "pin"

    # --- Sesión del ecosistema ---

    def verify_session_token(self, token: str | None) -> str | None:
        secret = self._secret()
        if not token or not secret:
            return None

        try:
            raw = base64.urlsafe_b64decode(token.encode("ascii")).decode("utf-8")
            payload, sig = raw.rsplit(".", 1)
        except (ValueError, UnicodeDecodeError):
            return None

        expected = hmac.new(
            secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(expected, sig):
            return None

        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            return None

        exp = data.get("exp")
        username = data.get("u")
        if not isinstance(exp, int) or not isinstance(username, str):
            return None
        if exp < int(time.time()):
            return None
        return username

    # --- PIN (solo cuando no hay SECRET) ---

    def _pin(self) -> str:
        return str(config("DASHBOARD_PIN", default="1234")).strip()

    def check_pin(self, pin: str | None) -> bool:
        return bool(pin) and pin.strip() == self._pin()

    def verify_pin(self, pin: str | None) -> None:
        if not self.check_pin(pin):
            raise HTTPException(status_code=401, detail="PIN incorrecto.")

    # --- Puerta única del dashboard ---

    def require_access(self, session_token: str | None, pin: str | None) -> str:
        if self.mode() == "session":
            username = self.verify_session_token(session_token)
            if not username:
                raise HTTPException(status_code=401, detail="Sesión inválida o expirada.")
            return username

        self.verify_pin(pin)
        return "local"
