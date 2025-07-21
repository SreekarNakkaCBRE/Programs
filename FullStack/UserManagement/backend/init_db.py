
from app.dbconfig.database import engine, Base, SessionLocal
from app.models import user_model, role_model  # Import all models
from app.models.user_model import User
from app.models.role_model import Role
from app.services.user_service import hash_password

def init_db():
    """Create all database tables and initialize with fixed roles and admin user"""
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    
    # Create session for data initialization
    db = SessionLocal()
    
    try:
        # Create fixed roles with specific IDs
        admin_role = db.query(Role).filter(Role.id == 1).first()
        if not admin_role:
            admin_role = Role(id=1, name="admin")
            db.add(admin_role)
            print("✅ Created 'admin' role with ID=1")
        
        standard_role = db.query(Role).filter(Role.id == 2).first()
        if not standard_role:
            standard_role = Role(id=2, name="standard_user")
            db.add(standard_role)
            print("✅ Created 'standard_user' role with ID=2")
        
        db.commit()
        
        # Create default admin user with role_id=1
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
            admin_user = User(
                first_name="Admin",
                last_name="User",
                email="admin@example.com",
                password_hash=hash_password("admin123"),
                contact_number="+1234567890",
                address="Admin Office",
                role_id=1  # Fixed ID for admin role
            )
            db.add(admin_user)
            db.commit()
            print("✅ Created default admin user:")
            print("   📧 Email: admin@example.com")
            print("   🔑 Password: admin123")
            print("   👑 Role: admin (ID=1)")
        else:
            print("ℹ️  Admin user already exists")
            
        print("\n🎉 Database initialization complete!")
        print("\n📋 Role Structure:")
        print("   👑 admin (ID=1)")
        print("   👤 standard_user (ID=2)")
        print("\n📋 Default Users:")
        print("   👑 Admin: admin@example.com / admin123")
        print("   👤 New signups will get role_id=2 (standard_user)")
        
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
