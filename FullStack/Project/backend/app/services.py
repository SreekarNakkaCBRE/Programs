from sqlalchemy.orm import Session
from . import models, schemas

def get_all_employee(db: Session):
    return db.query(models.Employee).all()

def get_employee(db: Session, employee_id: int):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()

def create_employee(db:Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(
        name=employee.name,
        email=employee.email,
        age=employee.age,
        department=employee.department
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee(db: Session, employee_id: int, employee: schemas.EmployeeUpdate):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if db_employee:
        db_employee.name = employee.name
        db_employee.email = employee.email
        db_employee.age = employee.age
        db_employee.department = employee.department
        db.commit()
        db.refresh(db_employee)
    return db_employee

def delete_employee(db: Session, employee_id: int):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if db_employee:
        db.delete(db_employee)
        db.commit()
        return True
    return False

