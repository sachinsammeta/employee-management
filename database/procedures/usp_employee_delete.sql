CREATE OR REPLACE PROCEDURE usp_employee_delete
(
    p_employee_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN

    DELETE FROM employee
    WHERE employee_id = p_employee_id;

END;
$$;