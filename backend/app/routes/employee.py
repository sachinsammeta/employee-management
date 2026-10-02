import os

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from app.database import get_connection
from app.services.excel_service import read_employee_excel


router = APIRouter()


class EmployeeRequest(BaseModel):
    employee_name: str
    department: str
    salary: int


@router.get("/employees")
def get_employees():

    conn = get_connection()

    try:
        with conn.cursor() as cursor:

            cursor.execute("""
                SELECT
                    employee_id,
                    employee_name,
                    department,
                    salary,
                    created_date
                FROM vw_employee
                ORDER BY employee_id
            """)

            rows = cursor.fetchall()

            employees = []

            for row in rows:
                employees.append({
                    "employee_id": row[0],
                    "employee_name": row[1],
                    "department": row[2],
                    "salary": float(row[3]) if row[3] is not None else None,
                    "created_date": row[4]
                })

            return employees

    finally:
        conn.close()


@router.post("/employees")
def create_employee(employee: EmployeeRequest):

    conn = get_connection()

    try:
        with conn.cursor() as cursor:

            cursor.execute(
                """
                CALL usp_employee_insert(%s, %s, %s)
                """,
                (
                    employee.employee_name,
                    employee.department,
                    employee.salary
                )
            )

        conn.commit()

        return {
            "message": "Employee created successfully"
        }

    finally:
        conn.close()


@router.put("/employees/{employee_id}")
def update_employee(
    employee_id: int,
    employee: EmployeeRequest
):

    conn = get_connection()

    try:
        with conn.cursor() as cursor:

            cursor.execute(
                """
                CALL usp_employee_update(%s, %s, %s, %s)
                """,
                (
                    employee_id,
                    employee.employee_name,
                    employee.department,
                    employee.salary
                )
            )

        conn.commit()

        return {
            "message": "Employee updated successfully"
        }

    finally:
        conn.close()


@router.delete("/employees/{employee_id}")
def delete_employee(employee_id: int):

    conn = get_connection()

    try:
        with conn.cursor() as cursor:

            cursor.execute(
                """
                CALL usp_employee_delete(%s)
                """,
                (employee_id,)
            )

        conn.commit()

        return {
            "message": "Employee deleted successfully"
        }

    finally:
        conn.close()


@router.post("/employees/upload")
def upload_employee_excel(file: UploadFile = File(...)):

    file_path = f"temp_{file.filename}"

    try:

        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())

        df = read_employee_excel(file_path)

        conn = get_connection()

        try:
            with conn.cursor() as cursor:

                # Load Excel data into staging
                for _, row in df.iterrows():

                    cursor.execute(
                        """
                        INSERT INTO employee_excel_staging
                        (
                            employee_name,
                            department,
                            salary
                        )
                        VALUES (%s, %s, %s)
                        """,
                        (
                            row["employee_name"],
                            row["department"],
                            row["salary"]
                        )
                    )

                # Call PostgreSQL import procedure
                cursor.execute(
                    """
                    CALL usp_employee_import_from_staging(%s, %s)
                    """,
                    (0, 0)
                )

                result = cursor.fetchone()

            conn.commit()

        except Exception:
            conn.rollback()
            raise

        finally:
            conn.close()

        inserted = result[0]
        updated = result[1]

        return {
            "message": "Excel import completed successfully",
            "inserted": inserted,
            "updated": updated,
            "rows": len(df)
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Excel import failed: {str(error)}"
        )

    finally:

        if os.path.exists(file_path):
            os.remove(file_path)