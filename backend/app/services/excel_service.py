import pandas as pd


REQUIRED_COLUMNS = [
    "employee_name",
    "department",
    "salary"
]


def read_employee_excel(file_path):

    df = pd.read_excel(file_path)

    # Check required columns
    missing_columns = [
        column
        for column in REQUIRED_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {', '.join(missing_columns)}"
        )

    # Keep only required columns
    df = df[REQUIRED_COLUMNS]

    # Remove completely empty rows
    df = df.dropna(how="all")

    # Validate employee name
    if df["employee_name"].isnull().any():
        raise ValueError("employee_name cannot be empty")

    # Validate department
    if df["department"].isnull().any():
        raise ValueError("department cannot be empty")

    # Validate salary
    df["salary"] = pd.to_numeric(
        df["salary"],
        errors="coerce"
    )

    if df["salary"].isnull().any():
        raise ValueError("salary must contain valid numbers")

    return df