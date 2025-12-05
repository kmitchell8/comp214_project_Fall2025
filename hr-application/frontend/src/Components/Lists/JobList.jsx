import React, { useState, useEffect, useCallback } from 'react'
import './JobList.css'
import jobApi from '../Api/jobApi';


const _formatCurrency = (amount) => { //currently not in use (remove _ to activate if needed)
    //Ensure only numbers are formatted
    if (typeof amount !== 'number') return amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0 }).format(amount);
};

// JobList receives pathSegments from JobView for potential nested routing.
const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [editedJobs, setEditedJobs] = useState([]); //Data being edited (Local State)
    const [loading, setLoading] = useState(true);
    const [error, setErr] = useState(null);

    //Columns to display, mapped to the uppercase keys returned by the Oracle Controller's SQL.
    const columns = [
        { header: 'ID', key: 'JOB_ID', fieldKey: 'JOB_ID', editable: false },
        //{ header: 'First Name', key: 'FIRST_NAME', fieldKey: 'FIRST_NAME', editable: false },
        { header: 'Job Title', key: 'JOB_TITLE', fieldKey: 'JOB_TITLE', editable: true },
        { header: 'Min Salary', key: 'MIN_SALARY', fieldKey: 'MIN_SALARY', editable: true, isNumeric: true },
        { header: 'Max Salary', key: 'MAX_SALARY', fieldKey: 'MAX_SALARY', editable: true, isNumeric: true },
        //{ header: 'Formatted Salary', key: 'SALARY_FORMATTED', fieldKey: 'SALARY', editable: false, format: formatCurrency },
    ];

    useEffect(() => {
        async function loadJobs() {
            setLoading(true);
            setErr(null);
            try {
                const data = await jobApi.list();
                setJobs(data);
                setEditedJobs(JSON.parse(JSON.stringify(data))); //intially will be the original table data
            } catch (error) {
                //update API error state
                setErr(error.message || "An unknown error occurred while listing data.");
            } finally {
                setLoading(false);
            }
        }
        loadJobs();
    }, []);

    //creates a new value in client side object based on the jobId 
    const handleCellChange = useCallback((jobId, key, value, isNumeric) => {
        setEditedJobs(prevJobs => {
            return prevJobs.map(job => {
                if (job.JOB_ID === jobId) {
                    // Create a new job object with the updated value
                    const finalValue = (isNumeric && value !== '') ? Number(value) : value;
                    return { ...job, [key]: finalValue };
                }
                return job;
            });
        });
    }, []);

    const handleUpdate = async (jobId) => {
        //Find the modified data for this specific job
        const jobData = editedJobs.find(job => job.JOB_ID === jobId);

        if (!jobData) return;
        const checkedData = {
            JOB_TITLE: jobData.JOB_TITLE,
            MIN_SALARY: jobData.MIN_SALARY,
            MAX_SALARY: jobData.MAX_SALARY                        
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
        // Function to check if an job object has changed

        try {
            await jobApi.update(jobId, checkedData, null);

            //Update the "Source of Truth" to match the saved data
            //This ensures that if we cancel later (not implemented yet), we revert to this saved state
            setJobs(prev => prev.map(e => e.JOB_ID === jobId ? jobData : e));

            alert(`Job ${jobId} updated successfully!`);
        } catch (error) {
            console.error("Update failed", error);
            alert(`Failed to update job: ${error.message}`);
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
        //mapping from JOB_ID to the original data for comparison
        const originalMap = new Map(jobs.map(job => [job.JOB_ID, job]));

        const jobsToUpdate = editedJobs.filter(editedEmp => {
            const originalEmp = originalMap.get(editedEmp.JOB_ID);

            //jobs that exist and actually have changes
            return originalEmp && hasChanges(originalEmp, editedEmp);
        });

        if (jobsToUpdate.length === 0) {
            return alert("No changes detected.");
        }

        let successCount = 0;
        let failCount = 0;

        for (const job of jobsToUpdate) {
            try {
                //Re-use handleUpdate logic
                await handleUpdate(job.JOB_ID);
                successCount++;
            } catch (error) {
                console.error(`Failed to update job ${job.JOB_ID}`, error);
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
                <p>Loading Job Data...</p>
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

    if (jobs.length === 0) {
        return (
            <div className="info-box empty-box">
                <p>No jobs found in the directory.</p>
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


        <div className="job-table-container">
            <><UpdateAllButton /></>
            <><ReloadList /></>
            <h1>Job Directory</h1>
            <table className="job-table">
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
                    {editedJobs.map((job, index) => {
                        return (
                            <tr key={job.JOB_ID || index}>
                                {columns.map((col) => {
                                    //Use fieldKey to retrieve the actual data value
                                    const currentValue = job[col.fieldKey] || '';
                                    const isEditable = col.editable;

                                    return (
                                        <td key={col.key}>
                                            {isEditable ? (
                                                <input
                                                    //Use isNumeric property to set input type
                                                    type={col.isNumeric ? 'number' : 'text'}
                                                    value={currentValue}
                                                    //Pass fieldKey to the change handler
                                                    onChange={(e) => handleCellChange(job.JOB_ID, col.fieldKey, e.target.value, col.isNumeric)}
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
                                        onClick={() => handleUpdate(job.JOB_ID)}
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

export default JobList;