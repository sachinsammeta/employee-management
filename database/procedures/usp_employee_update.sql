
CREATE OR REPLACE PROCEDURE usp_employee_update
(
    p_employee_id INTEGER,
    p_employee_name VARCHAR,
    p_department VARCHAR,
    p_salary NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN

    UPDATE employee
    SET
        employee_name = p_employee_name,
        department = p_department,
        salary = p_salary
    WHERE employee_id = p_employee_id;

END;
