CREATE OR REPLACE PROCEDURE usp_employee_insert
(
    p_employee_name VARCHAR,
    p_department VARCHAR,
    p_salary NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN

    INSERT INTO employee
    (
        employee_name,
        department,
        salary
    )
    VALUES
    (
        p_employee_name,
        p_department,
        p_salary
    );

END;
$$;
