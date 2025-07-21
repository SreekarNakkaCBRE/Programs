from app.dbconfig.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.role import Role

def init_db():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    default_roles = ["super_admin", "admin", "standard_user"]
    for role_name in default_roles:
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            new_role = Role(name=role_name)
            db.add(new_role)
    db.commit()
    db.close()
