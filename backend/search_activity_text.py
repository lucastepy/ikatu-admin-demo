
from sqlalchemy.orm import Session
from database import SessionLocal
import models

def search_activity():
    db = SessionLocal()
    try:
        term = "OTROS TIPOS DE COMERCIO"
        results = db.query(models.ActividadEconomica).filter(models.ActividadEconomica.act_eco_dsc.ilike(f"%{term}%")).all()
        
        print(f"Searching for '{term}': Found {len(results)} results.")
        for r in results:
            print(f" - {r.act_eco_cod}: {r.act_eco_dsc}")

    finally:
        db.close()

if __name__ == "__main__":
    search_activity()
