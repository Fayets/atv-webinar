"""Regla de calificación del quiz.

Un lead califica cuando su perfil está en la lista de avatares objetivo Y su
facturación mensual llega al piso. Se evalúa en el backend para no confiar en
lo que mande el cliente.
"""

QUALIFIED_AVATARS = frozenset(
    {
        "Coaching / Mentoria / Consultoria",
        "Creador con infoproducto",
        "Experto en infoproductos / Growth Operator",
        "Dueño de agencia",
    }
)

# Piso: desde $3k/mes (antes era $5k).
QUALIFIED_REVENUES = frozenset(
    {
        "$3k a 5k",
        "$5k a 10k",
        "$10k a 30k",
        "$30k a 50k",
        "+$50k",
    }
)


def is_qualified(avatar: str | None, revenue: str | None) -> bool:
    return (avatar or "") in QUALIFIED_AVATARS and (revenue or "") in QUALIFIED_REVENUES
