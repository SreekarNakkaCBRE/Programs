from .database import get_db
from .schemas import EmployeeCreate, EmployeeUpdate, Employee
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .services import get_all_employee, get_employee, create_employee, update_employee, delete_employee


router = APIRouter()

@router.get("/employees", response_model=list[Employee])
def read_employees( db: Session =Depends(get_db)):
    employees = get_all_employee(db)
    return employees

@router.get("/employees/{employee_id}", response_model=Employee)
def read_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.post("/employees/create", response_model=Employee)
def create_new_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    return create_employee(db, employee)

@router.put("/employees/update/{employee_id}", response_model=Employee)
def update_existing_employee(employee_id: int, employee: EmployeeUpdate, db: Session = Depends(get_db)):
    updated_employee = update_employee(db, employee_id, employee)
    if not updated_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return updated_employee

@router.delete("/employees/delete/{employee_id}", response_model=dict)
def delete_existing_employee(employee_id: int, db: Session = Depends(get_db)):
    if delete_employee(db, employee_id):
        return {"message": "Employee deleted successfully"}
    raise HTTPException(status_code=404, detail="Employee not found")
