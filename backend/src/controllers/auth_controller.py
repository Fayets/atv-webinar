from fastapi import APIRouter, HTTPException, Request

from src.schemas import AuthModeResponse, PinRequest, PinResponse, SessionResponse
from src.services.auth_services import SESSION_COOKIE_NAME, AuthServices

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
