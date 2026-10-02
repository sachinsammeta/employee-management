import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [salary, setSalary] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const loadEmployees = () => {
    fetch("http://127.0.0.1:8000/api/employees")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load employees");
        }

        return response.json();
      })
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
        setMessage("Failed to load employees");
        setMessageType("error");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      clearMessage();
    }, 4000);
  };

  const clearForm = () => {
    setEmployeeName("");
    setDepartment("");
    setSalary("");
    setEditingId(null);
  };

  const saveEmployee = async (event) => {
    event.preventDefault();

    if (!employeeName.trim()) {
      showMessage("Employee name is required", "error");
      return;
    }

    if (!department.trim()) {
      showMessage("Department is required", "error");
      return;
    }

    if (!salary || Number(salary) <= 0) {
      showMessage("Please enter a valid salary", "error");
      return;
    }

    const employee = {
      employee_name: employeeName.trim(),
      department: department.trim(),
      salary: Number(salary)
    };

    try {
      let url = "http://127.0.0.1:8000/api/employees";
      let method = "POST";

      if (editingId !== null) {
        url = `http://127.0.0.1:8000/api/employees/${editingId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(employee)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save employee");
      }

      if (editingId !== null) {
        showMessage("Employee updated successfully", "success");
      } else {
        showMessage("Employee added successfully", "success");
      }

      clearForm();
      loadEmployees();

    } catch (error) {
      console.error("Error saving employee:", error);
      showMessage(error.message, "error");
    }
  };

  const editEmployee = (employee) => {
    setEditingId(employee.employee_id);
    setEmployeeName(employee.employee_name);
    setDepartment(employee.department);
    setSalary(employee.salary);
    clearMessage();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const deleteEmployee = async (employeeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/employees/${employeeId}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete employee");
      }

      showMessage("Employee deleted successfully", "success");
      loadEmployees();

    } catch (error) {
      console.error("Error deleting employee:", error);
      showMessage(error.message, "error");
    }
  };

  const uploadExcel = async () => {
    if (!selectedFile) {
      showMessage("Please select an Excel file", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/employees/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Excel upload failed");
      }

      showMessage(
        `Excel imported successfully — Inserted: ${data.inserted}, Updated: ${data.updated}`,
        "success"
      );

      setSelectedFile(null);

      const fileInput = document.getElementById("excelFile");

      if (fileInput) {
        fileInput.value = "";
      }

      loadEmployees();

    } catch (error) {
      console.error("Excel upload error:", error);
      showMessage(error.message, "error");
    }
  };

  const totalEmployees = employees.length;

  const totalSalary = employees.reduce(
    (total, employee) => total + Number(employee.salary || 0),
    0
  );

  return (
    <div className="app-container">

      <header className="app-header">
        <div>
          <h1>Employee Management</h1>
          <p>Manage employees and import employee data from Excel</p>
        </div>
      </header>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="dashboard">

        <div className="summary-card">
          <span className="summary-title">Total Employees</span>
          <strong>{totalEmployees}</strong>
        </div>

        <div className="summary-card">
          <span className="summary-title">Departments</span>
          <strong>
            {new Set(
              employees
                .map((employee) => employee.department)
                .filter(Boolean)
            ).size}
          </strong>
        </div>

        <div className="summary-card">
          <span className="summary-title">Total Salary</span>
          <strong>
            ₹{totalSalary.toLocaleString("en-IN")}
          </strong>
        </div>

      </div>

      <div className="content-grid">

        <section className="card">

          <div className="card-header">
            <h2>
              {editingId !== null
                ? "Edit Employee"
                : "Add Employee"}
            </h2>
          </div>

          <form onSubmit={saveEmployee} className="employee-form">

            <div className="form-group">
              <label>Employee Name</label>

              <input
                type="text"
                placeholder="Enter employee name"
                value={employeeName}
                onChange={(event) =>
                  setEmployeeName(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Department</label>

              <input
                type="text"
                placeholder="Enter department"
                value={department}
                onChange={(event) =>
                  setDepartment(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Salary</label>

              <input
                type="number"
                placeholder="Enter salary"
                value={salary}
                onChange={(event) =>
                  setSalary(event.target.value)
                }
              />
            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-button"
              >
                {editingId !== null
                  ? "Update Employee"
                  : "Add Employee"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>


        <section className="card">

          <div className="card-header">
            <h2>Excel Import</h2>
          </div>

          <div className="upload-section">

            <p>
              Upload an Excel file containing employee data.
            </p>

            <p className="upload-format">
              Required columns: employee_name, department, salary
            </p>

            <input
              id="excelFile"
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) =>
                setSelectedFile(event.target.files[0])
              }
            />

            {selectedFile && (
              <div className="selected-file">
                Selected: {selectedFile.name}
              </div>
            )}

            <button
              type="button"
              className="upload-button"
              onClick={uploadExcel}
            >
              Upload Excel
            </button>

          </div>

        </section>

      </div>


      <section className="card employee-table-card">

        <div className="card-header">
          <div>
            <h2>Employees</h2>
            <p>{totalEmployees} employee(s)</p>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            Loading employees...
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            No employees found.
          </div>
        ) : (
          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Salary</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {employees.map((employee) => (
                  <tr key={employee.employee_id}>

                    <td>{employee.employee_id}</td>

                    <td className="employee-name">
                      {employee.employee_name}
                    </td>

                    <td>
                      <span className="department-badge">
                        {employee.department}
                      </span>
                    </td>

                    <td>
                      ₹{Number(employee.salary).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {employee.created_date
                        ? new Date(
                            employee.created_date
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td>

                      <div className="action-buttons">

                        <button
                          className="edit-button"
                          onClick={() =>
                            editEmployee(employee)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteEmployee(
                              employee.employee_id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}

export default App;