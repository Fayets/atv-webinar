from pony.orm import db_session

from src.models import PageView


class VisitsServices:
    def record(self) -> None:
        with db_session:
            PageView()

    def clear(self) -> None:
        with db_session:
            PageView.select().delete(bulk=True)
