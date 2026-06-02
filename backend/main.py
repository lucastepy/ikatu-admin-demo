from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import admin_router
import integration_router

app = FastAPI(title="Ikatu Admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router.router)
app.include_router(integration_router.router)

@app.get("/")
def read_root():
    return {"message": "Ikatu Admin API Running"}
