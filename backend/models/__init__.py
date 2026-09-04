# Import all models here in dependency order so SQLAlchemy's mapper registry
# has every class registered before any relationship() is resolved.
#
# Import order:
#   1. user  — no FK dependencies on other app models
#   2. trip  — FK → users
#   3. conversation + message — FK → users / conversations

from models.user import User                          # noqa: F401
from models.trip import Trip                          # noqa: F401
from models.conversation import Conversation, Message  # noqa: F401
