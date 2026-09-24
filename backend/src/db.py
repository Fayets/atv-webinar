import sqlite3
from pathlib import Path

from decouple import config
from pony.orm import Database

db = Database()

_BACKEND_DIR = Path(__file__).resolve().parent.parent

PROVIDER = config("DB_PROVIDER", default="sqlite")
DB_SCHEMA = config("DB_SCHEMA", default="webinar")

# En Postgres la tabla va calificada por esquema, como en el resto del ecosistema.
# En SQLite se deja el nombre que Pony ya venía usando para no perder la base local.
LEAD_TABLE = (DB_SCHEMA, "leads") if PROVIDER == "postgres" else "Lead"
PAGE_VIEW_TABLE = (DB_SCHEMA, "page_views") if PROVIDER == "postgres" else "PageView"

# Columnas agregadas después del primer release. Pony crea tablas nuevas pero no
# altera las existentes, así que las sumamos a mano antes de mapear.
_LEAD_COLUMNS = (
    ("instagram", "TEXT"),
    ("avatar", "TEXT"),
    ("revenue", "TEXT"),
    ("bottleneck_areas", "TEXT"),
    ("bottleneck_marketing", "TEXT"),
    ("bottleneck_ventas", "TEXT"),
    ("bottleneck_producto", "TEXT"),
    ("calificado", "BOOLEAN"),
    ("contacted", "BOOLEAN NOT NULL DEFAULT 0"),
    ("responsable", "TEXT"),
    ("notes", "TEXT"),
    ("wa_clicks", "INTEGER NOT NULL DEFAULT 0"),
    ("wa_first_click_at", "DATETIME"),
    ("wa_last_click_at", "DATETIME"),
    ("calendar_clicks", "INTEGER NOT NULL DEFAULT 0"),
    ("calendar_first_click_at", "DATETIME"),
    ("calendar_last_click_at", "DATETIME"),
)


def _sqlite_path() -> Path:
    return _BACKEND_DIR / config("DB_FILENAME", default="database.sqlite")


def _postgres_params() -> dict:
    return {
        "host": config("DB_HOST"),
        "port": config("DB_PORT", default=5432, cast=int),
        "database": config("DB_NAME"),
        "user": config("DB_USER"),
        "password": config("DB_PASSWORD"),
    }


def migrate_sqlite() -> None:
    path = _sqlite_path()
    if not path.exists():
        return

    connection = sqlite3.connect(str(path))
    try:
        tables = connection.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='Lead'"
        ).fetchall()
        if not tables:
            return

        existing = {row[1] for row in connection.execute('PRAGMA table_info("Lead")')}
        for column, declaration in _LEAD_COLUMNS:
            if column not in existing:
                connection.execute(f'ALTER TABLE "Lead" ADD COLUMN "{column}" {declaration}')
        connection.commit()
    finally:
        connection.close()


def ensure_postgres_schema() -> None:
    """El esquema tiene que existir antes de que Pony cree la tabla adentro."""
    import psycopg2

    connection = psycopg2.connect(
        sslmode=config("DB_SSLMODE", default="require"), **_postgres_params()
    )
    connection.autocommit = True
    try:
        with connection.cursor() as cur:
            cur.execute(f'CREATE SCHEMA IF NOT EXISTS "{DB_SCHEMA}"')
    finally:
        connection.close()


def migrate_postgres() -> None:
    """Columnas nuevas sobre una tabla que ya existe. En un esquema recién creado
    no hace nada: `create_tables` ya la deja completa."""
    import psycopg2

    connection = psycopg2.connect(
        sslmode=config("DB_SSLMODE", default="require"), **_postgres_params()
    )
    connection.autocommit = True
    try:
        with connection.cursor() as cur:
            cur.execute(
                "SELECT to_regclass(%s)", (f'"{DB_SCHEMA}"."leads"',)
            )
            if cur.fetchone()[0] is None:
                return
            table = f'"{DB_SCHEMA}"."leads"'
            for column, declaration in _LEAD_COLUMNS:
                pg_type = declaration.replace("DATETIME", "TIMESTAMP").replace(
                    "DEFAULT 0", "DEFAULT 0"
                )
                cur.execute(
                    f'ALTER TABLE {table} ADD COLUMN IF NOT EXISTS "{column}" {pg_type}'
                )
    finally:
        connection.close()


def bind_db() -> None:
    if PROVIDER == "postgres":
        ensure_postgres_schema()
        db.bind(provider="postgres", **_postgres_params())
        return

    filename = config("DB_FILENAME", default="database.sqlite")
    db.bind(provider="sqlite", filename=str(_BACKEND_DIR / filename), create_db=True)


def init_db() -> None:
    import src.models  # noqa: F401 — registra entidades en `db`

    if not db.provider:
        bind_db()

    if PROVIDER == "postgres":
        migrate_postgres()
    else:
        migrate_sqlite()

    db.generate_mapping(create_tables=True)
