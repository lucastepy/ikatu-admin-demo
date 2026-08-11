import bcrypt
import sys

hashed = b'$2b$12$5rjdeU0Eg6hVzhqhYf9jpOVg4FnFY4Ud80uDp9AjdF6ZWG7GZU7A2'

for pw in ["admin", "admin123", "1234", "ikatu2024", "password"]:
    if bcrypt.checkpw(pw.encode('utf-8'), hashed):
        print(f"PASSWORD FOUND: {pw}")
        sys.exit(0)
print("Not found")
