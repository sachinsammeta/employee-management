CREATE OR REPLACE VIEW vw_employee AS
SELECT
    employee_id,
    employee_name,
    department,
    salary,
    created_date
FROM employee;