import logging
import sys

from core.logging.handler import JsonFormatter

LOG = logging.getLogger("medinova-agent")
LOG.setLevel(logging.INFO)

_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(JsonFormatter())
LOG.addHandler(_handler)
