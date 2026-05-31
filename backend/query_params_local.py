import sys
import os

from database import SessionLocal
import models

db = SessionLocal()
try:
    print("MATCHING PARAMETERS:")
    params = db.query(models.Parametro).filter(models.Parametro.par_codigo.like('EMP_%')).all()
    for p in params:
        print(f"par_codigo: {p.par_codigo} | par_tenantId: {p.par_tenantId} | par_valor: {p.par_valor}")
    
    print("\nMATCHING EMPRESA:")
    emp = db.query(models.Empresa).first()
    if emp:
        for k, v in emp.__dict__.items():
            if not k.startswith('_'):
                print(f"{k}: {v}")
    else:
        print("No Empresa row found!")
except Exception as e:
    print("ERROR QUERYING DATABASE:")
    import traceback
    traceback.print_exc()
finally:
    db.close()
