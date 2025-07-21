from app.dbconfig.database import SessionLocal
from app.models.role import Role

def seed_roles():
    db = SessionLocal()
    existing = db.query(Role).count()
    if existing == 0:
        db.add_all([
            Role(id = 1, name="admin"),
            Role(id = 2, name="user"),
        ])
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_roles()
    print("Roles seeded successfully.")