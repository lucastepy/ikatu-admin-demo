import urllib.request
import json

urls = [
    "http://localhost:5001/",
    "http://localhost:5001/api/admin/parametros-sistema",
    "http://localhost:5001/api/admin/restricciones-campos",
    "http://localhost:5001/api/admin/restricciones-campos/tenants"
]

for url in urls:
    try:
        req = urllib.request.Request(url, method="GET")
        # Admin requests require authorization token, let's see if we get 401 or 404
        with urllib.request.urlopen(req) as res:
            print(f"URL: {url} -> Status: {res.status}")
    except urllib.error.HTTPError as e:
        print(f"URL: {url} -> HTTP Error: {e.code} ({e.read().decode('utf-8', errors='ignore')})")
    except Exception as e:
        print(f"URL: {url} -> General Error: {e}")
