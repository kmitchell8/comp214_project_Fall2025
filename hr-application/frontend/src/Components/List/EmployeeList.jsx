import React, { useState, useEffect, useCallback } from 'react'
import './EmployeeList.css'
import employeeApi from '../Api/employeeApi';


const formatCurrency = (amount) => {
    //Ensure only numbers are formatted
    if (typeof amount !== 'number') return amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0 }).format(amount);
};

// EmployeeList receives pathSegments from EmployeeView for potential nested routing.
const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [editedEmployees, setEditedEmployees] = useState([]); //Data being edited (Local State)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //Columns to display, mapped to the uppercase keys returned by the Oracle Controller's SQL.
    const columns = [
        { header: 'ID', key: 'EMPLOYEE_ID', fieldKey: 'EMPLOYEE_ID', editable: false },
        //{ header: 'First Name', key: 'FIRST_NAME', fieldKey: 'FIRST_NAME', editable: false },
        { header: 'Last Name', key: 'LAST_NAME', fieldKey: 'LAST_NAME', editable: false },
        { header: 'Job ID', key: 'JOB_ID', fieldKey: 'JOB_ID', editable: false },
        { header: 'Department ID', key: 'DEPARTMENT_ID', fieldKey: 'DEPARTMENT_ID', editable: false },
        { header: 'Email', key: 'EMAIL', fieldKey: 'EMAIL', editable: true },
        { header: 'Phone', key: 'PHONE_NUMBER', fieldKey: 'PHONE_NUMBER', editable: true },
        { header: 'Raw Salary', key: 'SALARY_RAW', fieldKey: 'SALARY', editable: true, isNumeric: true },
        { header: 'Formatted Salary', key: 'SALARY_FORMATTED', fieldKey: 'SALARY', editable: false, format: formatCurrency },
    ];

    useEffect(() => {
        async function loadEmployees() {
            setLoading(true);
            setError(null);
            try {
                const data = await employeeApi.list();
                setEmployees(data);
                setEditedEmployees(JSON.parse(JSON.stringify(data))); //intially will be the original table data
            } catch (err) {
                //update API error state
                setError(err.message || "An unknown error occurred while listing data.");
            } finally {
                setLoading(false);
            }
        }
        loadEmployees();
    }, []);

    //creates a new value in client side object based on the employeeId 
    const handleCellChange = useCallback((employeeId, key, value, isNumeric) => {
        setEditedEmployees(prevEmployees => {
            return prevEmployees.map(emp => {
                if (emp.EMPLOYEE_ID === employeeId) {
                    // Create a new employee object with the updated value
                    const finalValue = (isNumeric && value !== '') ? Number(value) : value;
                    return { ...emp, [key]: finalValue };
                }
                return emp;
            });
        });
    }, []);

    const handleUpdate = async (employeeId) => {
        //Find the modified data for this specific employee
        const employeeData = editedEmployees.find(emp => emp.EMPLOYEE_ID === employeeId);

        if (!employeeData) return;
        const checkedData = {
            //FIRST_NAME: employeeData.FIRST_NAME,
            //LAST_NAME: employeeData.LAST_NAME,
            EMAIL: employeeData.EMAIL ? employeeData.EMAIL.toUpperCase() : employeeData.EMAIL,
            //JOB_ID: employeeData.JOB_ID,
            SALARY: employeeData.SALARY,
            //DEPARTMENT_ID: employeeData.DEPARTMENT_ID,
            PHONE_NUMBER: employeeData.PHONE_NUMBER,
            //COMMISSION_PCT: employeeData.COMMISSION_PCT,
            // MANAGER_ID: employeeData.MANAGER_ID,
        };
        const cleandData = Object.keys(checkedData).reduce((acc, key) => {
            if (checkedData[key] !== undefined && checkedData[key] !== null) {
                acc[key] = checkedData[key];
            }
            return acc;
        }, {});

        if (Object.keys(cleandData).length === 0) {
            return alert("No changes detected or all fields are invalid/empty.");
        }
        // Function to check if an employee object has changed

        try {
            await employeeApi.update(employeeId, checkedData, null);

            //Update the "Source of Truth" to match the saved data
            //This ensures that if we cancel later (not implemented yet), we revert to this saved state
            setEmployees(prev => prev.map(e => e.EMPLOYEE_ID === employeeId ? employeeData : e));

            alert(`Employee ${employeeId} updated successfully!`);
        } catch (err) {
            console.error("Update failed", err);
            alert(`Failed to update employee: ${err.message}`);
        }
    };
    const hasChanges = (originalEmp, editedEmp) => {
        //check the keys that are editable/updatable in your columns array
        //can be expanded or reduced later to accomodate
        const updatableKeys = ['EMAIL', 'PHONE_NUMBER', 'SALARY'];

        // Check if any of the updatable fields have different values
        return updatableKeys.some(key => {
            return originalEmp[key] !== editedEmp[key];
        });
    };

    const handleUpdateAll = async () => {
        //mapping from EMPLOYEE_ID to the original data for comparison
        const originalMap = new Map(employees.map(emp => [emp.EMPLOYEE_ID, emp]));

        const employeesToUpdate = editedEmployees.filter(editedEmp => {
            const originalEmp = originalMap.get(editedEmp.EMPLOYEE_ID);

            //employees that exist and actually have changes
            return originalEmp && hasChanges(originalEmp, editedEmp);
        });

        if (employeesToUpdate.length === 0) {
            return alert("No changes detected.");
        }

        let successCount = 0;
        let failCount = 0;

        for (const employee of employeesToUpdate) {
            try {
                //Re-use handleUpdate logic
                await handleUpdate(employee.EMPLOYEE_ID);
                successCount++;
            } catch (error) {
                console.error(`Failed to update employee ${employee.EMPLOYEE_ID}`, error);
                failCount++;
            }
        }

        alert(`Batch Update Complete: ${successCount} successful updates, ${failCount} failures.`);

    };

    //RENDER STATES
    if (loading) {
        return (
            <div className="loading-container">
                {/*<div className="loading-spinner"></div>*/}
                <p>Loading Employee Data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="info-box error-box">
                <h2>Data Fetch Error</h2>
                <p>{error}</p>
                <p>Check your API status and network connection.</p>
            </div>
        );
    }

    if (employees.length === 0) {
        return (
            <div className="info-box empty-box">
                <p>No employees found in the directory.</p>
            </div>
        );
    }
    const ReloadList = () => {
        const handleReload = () => {
            window.location.reload();
        };//needs to be a separate function to stop constant reloads
        return (
            <div>
                <button onClick={handleReload}
                    className="button-group"
                >
                    Reload List
                </button>
            </div>
        );
    };

    const UpdateAllButton = () => {
        return (
            <div>
                <button
                    onClick={handleUpdateAll}
                    className="button-group"
                >
                    Update Changes
                </button>
            </div>
        );
    };
    //MAIN TABLE RENDER
    return (


        <div className="employee-table-container">
            <><UpdateAllButton /></>
            <><ReloadList /></>
            <h1>Employee Directory</h1>
            <table className="employee-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} scope="col">
                                {col.header}
                            </th>

                        ))}
                        <th className="action-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {editedEmployees.map((employee, index) => {
                        return (
                            <tr key={employee.EMPLOYEE_ID || index}>
                                {columns.map((col) => {
                                    //Use fieldKey to retrieve the actual data value
                                    const currentValue = employee[col.fieldKey] || '';
                                    const isEditable = col.editable;

                                    return (
                                        <td key={col.key}>
                                            {isEditable ? (
                                                <input
                                                    //Use isNumeric property to set input type
                                                    type={col.isNumeric ? 'number' : 'text'}
                                                    value={currentValue}
                                                    //Pass fieldKey to the change handler
                                                    onChange={(e) => handleCellChange(employee.EMPLOYEE_ID, col.fieldKey, e.target.value, col.isNumeric)}
                                                    className="editable-input" //Class for styling input
                                                />
                                            ) : (
                                                //Display non-editable fields
                                                col.format ? col.format(currentValue) : currentValue
                                            )}
                                        </td>
                                    );
                                })}
                                <td>
                                    <button
                                        className="button-group"
                                        onClick={() => handleUpdate(employee.EMPLOYEE_ID)}
                                    >
                                        Update
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>

            </table>

        </div>

    );
};

export default EmployeeList;