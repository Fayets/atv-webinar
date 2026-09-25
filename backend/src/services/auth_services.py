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
SESSION_MAX_AGE_SECONDS = 7 * 24 * 3600


class AuthServices:
    def _secret(self) -> str:
        return str(config("SECRET", default="")).strip()

    def mode(self) -> str:
        return "session" if self._secret() else "pin"

    # --- Sesión del ecosistema ---

    def _sign(self, payload: str) -> str:
        return hmac.new(
            self._secret().encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
        ).hexdigest()

    def _decode(self, token: str | None) -> dict | None:
        """Payload de un token firmado con SECRET y no vencido, o None."""
        if not token or not self._secret():
            return None

        try:
            raw = base64.urlsafe_b64decode(token.encode("ascii")).decode("utf-8")
            payload, sig = raw.rsplit(".", 1)
        except (ValueError, UnicodeDecodeError):
            return None

        if not hmac.compare_digest(self._sign(payload), sig):
            return None

        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            return None

        exp = data.get("exp")
        if not isinstance(exp, int) or not isinstance(data.get("u"), str):
            return None
        if exp < int(time.time()):
            return None
        return data

    def verify_session_token(self, token: str | None) -> str | None:
        data = self._decode(token)
        return data["u"] if data else None

    # --- Pase desde el ecosistema ---
    #
    # La cookie del ecosistema vive en .atvos.io y el navegador no la manda a otro
    # dominio. El tile pasa por ecosystem.atvos.io/api/auth/handoff, que emite un pase
    # de 60 s (mismo formato y SECRET, con "p": "handoff"); acá se canjea por una
    # sesión propia de este dominio con el mismo formato que la del ecosistema.

    def exchange_handoff(self, token: str | None) -> str | None:
        data = self._decode(token)
        if not data or data.get("p") != "handoff":
            return None
        return data["u"]

    def create_session_token(self, username: str) -> str:
        exp = int(time.time()) + SESSION_MAX_AGE_SECONDS
        payload = json.dumps({"u": username, "exp": exp}, separators=(",", ":"))
        raw = f"{payload}.{self._sign(payload)}".encode("utf-8")
        return base64.urlsafe_b64encode(raw).decode("ascii")

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
