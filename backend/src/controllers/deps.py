from fastapi import Header, Request

from src.services.auth_services import SESSION_COOKIE_NAME, AuthServices

service = AuthServices()


def require_access(request: Request, x_dashboard_pin: str | None = Header(default=None)) -> str:
    return service.require_access(request.cookies.get(SESSION_COOKIE_NAME), x_dashboard_pin)
