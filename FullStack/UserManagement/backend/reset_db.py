"""
Reset Database Script
This script will completely reset the database with proper role structure
"""

import os
from app.dbconfig.database import engine, Base, SessionLocal
from app.models import user_model, role_model
from app.models.user_model import User
from app.models.role_model import Role
from app.services.user_service import hash_password

def reset_database():
    """Reset database with proper role structure"""
    
    # Remove existing database file if it exists
    db_file = "role_management.db"
    if os.path.exists(db_file):
        os.remove(db_file)
        print("🗑️  Removed existing database file")
    
    # Create all tables fresh
    Base.metadata.create_all(bind=engine)
    print("✅ Created fresh database tables")
    
    # Create session
    db = SessionLocal()
    
    try:
        # Create fixed roles with explicit IDs
        print("\n📋 Creating fixed roles...")
        
        # Admin role with ID=1
        admin_role = Role(id=1, name="admin")
        db.add(admin_role)
        print("   ✅ Created admin role (ID=1)")
        
        # Standard user role with ID=2
        standard_role = Role(id=2, name="standard_user")
        db.add(standard_role)
        print("   ✅ Created standard_user role (ID=2)")
        
        db.commit()
        
        # Create default admin user
        print("\n👑 Creating default admin user...")
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
        print("   ✅ Created admin user: admin@example.com / admin123")
        
        # Verify the structure
        print("\n🔍 Verifying database structure...")
        roles = db.query(Role).all()
        users = db.query(User).all()
        
        print(f"   📊 Roles in database: {len(roles)}")
        for role in roles:
            print(f"      - ID={role.id}, Name={role.name}")
        
        print(f"   👥 Users in database: {len(users)}")
        for user in users:
            print(f"      - {user.first_name} {user.last_name} ({user.email}) - Role ID={user.role_id}")
        
        print("\n🎉 Database reset complete!")
        print("\n📋 Fixed Role Structure:")
        print("   👑 admin (ID=1)")
        print("   👤 standard_user (ID=2)")
        print("\n📋 Default Login:")
        print("   👑 Admin: admin@example.com / admin123")
        print("   👤 New signups will get role_id=2 (standard_user)")
        
    except Exception as e:
        print(f"❌ Error during reset: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Resetting database with proper role structure...")
    reset_database()
