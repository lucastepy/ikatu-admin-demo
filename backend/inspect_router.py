import admin_router
from fastapi import FastAPI

app = FastAPI()
app.include_router(admin_router.router)

print("Registered Routes:")
for route in app.routes:
    print(f"Path: {route.path} -> Methods: {route.methods}")
