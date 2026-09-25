from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse

from src.schemas import AuthModeResponse, PinRequest, PinResponse, SessionResponse
from src.services.auth_services import (
    SESSION_COOKIE_NAME,
    SESSION_MAX_AGE_SECONDS,
    AuthServices,
)

router = APIRouter()
service = AuthServices()


@router.get("/mode", response_model=AuthModeResponse)
def get_mode():
    try:
        return AuthModeResponse(mode=service.mode())
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al leer el modo de acceso.")


@router.get("/session", response_model=SessionResponse)
def get_session(request: Request):
    try:
        username = service.verify_session_token(request.cookies.get(SESSION_COOKIE_NAME))
        if not username:
            raise HTTPException(status_code=401, detail="No session")
        return SessionResponse(username=username)
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al validar la sesión.")


@router.post("/pin", response_model=PinResponse)
def check_pin(payload: PinRequest):
    try:
        service.verify_pin(payload.pin)
        return PinResponse(ok=True)
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al validar el PIN.")


@router.get("/handoff")
def handoff(t: str = ""):
    """Canjea el pase del ecosistema por una sesión de este dominio y abre el dashboard."""
    try:
        username = service.exchange_handoff(t)
        if not username:
            raise HTTPException(status_code=401, detail="Pase inválido o vencido.")
        response = RedirectResponse("/dashboard?desde=ecosistema", status_code=302)
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=service.create_session_token(username),
            max_age=SESSION_MAX_AGE_SECONDS,
            path="/",
            httponly=True,
            secure=True,
            samesite="lax",
        )
        return response
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Error inesperado al canjear el pase.")
