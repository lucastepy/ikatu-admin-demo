from contextvars import ContextVar

# This variable will store the target database schema for the current request
tenant_schema: ContextVar[str] = ContextVar("tenant_schema", default="public")
from typing import Any
tenant_id: ContextVar[Any] = ContextVar("tenant_id", default=None)
master_tenant_id: ContextVar[Any] = ContextVar("master_tenant_id", default=None)
