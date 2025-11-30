import React, { useState } from 'react';
import employeeApi from '../Api/employeeApi';
import './HiringForm.css'

const mockGetToken = async () => {
    //When you authentication enabled, this function will fetch 
    // the user's current JWT token.
    return null;
};

//Mock data for the dropdowns
const jobs = [
    { id: 'IT_PROG', title: 'Programmer' },
    { id: 'SA_REP', title: 'Sales Representative' },
    { id: 'AC_ACCOUNT', title: 'Accountant' },
    { id: 'FI_MGR', title: 'Finance Manager' },
];

const managers = [
    { employee_id: 100, firstName: 'Steven', lastName: 'King' },
    { employee_id: 101, firstName: 'Neena', lastName: 'Kochhar' },
    { employee_id: 102, firstName: 'Lex', lastName: 'De Haan' },
    { employee_id: 108, firstName: 'Nancy', lastName: 'Greenberg' },
];

const departments = [
    { id: 10, name: 'Administration' },
    { id: 20, name: 'Marketing' },
    { id: 50, name: 'Shipping' },
    { id: 90, name: 'Executive' },
    { id: 100, name: 'Finance' },
];

const HiringForm = () => {
    // Helper function to get the current date in YYYY-MM-DD format
    const getSysDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        salary: '',
        hireDate: getSysDate(),

        //Job selection state
        jobId: '',
        jobTitle: '',

        //Manager selection state
        managerId: '',
        managerFirstName: '',
        managerLastName: '',

        //Department selection state
        departmentId: '',
        departmentName: '',
    });

    // Handle standard textbox changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    //Linked Dropdown Logic (MOCK)

    //Job Dropdown Linkage
    const handleJobChange = (e) => {
        const selectedJobId = e.target.value;
        const job = jobs.find(j => j.id === selectedJobId) || { id: '', title: '' };

        setFormData(prev => ({
            ...prev,
            jobId: job.id,
            jobTitle: job.title,
        }));
    };

    //Manager Dropdown Linkage (using Employee_id as the primary selector)
    const handleManagerChange = (e) => {
        const selectedManagerId = parseInt(e.target.value);
        const manager = managers.find(m => m.employee_id === selectedManagerId) || { employee_id: '', firstName: '', lastName: '' };

        setFormData(prev => ({
            ...prev,
            managerId: manager.employee_id,
            managerFirstName: manager.firstName,
            managerLastName: manager.lastName,
        }));
    };

    //Department Dropdown Linkage
    const handleDepartmentChange = (e) => {
        const selectedDepartmentId = parseInt(e.target.value);
        const department = departments.find(d => d.id === selectedDepartmentId) || { id: '', name: '' };

        setFormData(prev => ({
            ...prev,
            departmentId: department.id,
            departmentName: department.name,
        }));
    };


    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);//in production there is a loading call in the AuthProvider but this will work for now
    //this call would be redundant code

    const handleCancel = (showClearedMessage = true) => {
        setFormData(prev => ({
            ...prev,
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            hireDate: new Date().toISOString().substring(0, 10),
            salary: '',
        }));
        if (showClearedMessage) {
            setFeedbackMessage('Form cleared.');
            setIsError(false);
        }
    };
    const withTimeout = (promise, timeoutMs = 10000) => {
        const timeout = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out. Please check your network or server logs."));
            }, timeoutMs);
        });
        return Promise.race([promise, timeout]);
    };
    //Implementing the API call logic (employeeApi/create)
    const handleHire = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedbackMessage('');
        setIsError(false);

        // Simple validation check
        if (!formData.firstName || !formData.email || !formData.salary) {
            setFeedbackMessage('Please fill in First Name, Email, and Salary.');
            setIsError(true);
            setIsLoading(false);
            return;
        }

        try {
            //Call the create method from employeeApi
            const apiPromise = employeeApi.create(formData, mockGetToken);
            const result = await withTimeout(apiPromise, 10000);
            handleCancel();
            //Assuming the controller returns a useful message upon success
            setFeedbackMessage(result.message || "Employee hired successfully!");
            setIsError(false);

            //Clear the form after successful submission
            

        } catch (error) {
            console.error("Hiring failed:", error);
            setFeedbackMessage(`Hiring failed: ${error.message}`);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className='hiring-form'>
            <h1 className="form-title">Employee Hiring Form</h1>
            {/* Feedback Message Area */}
            {feedbackMessage && (
                <div
                    className={`feedback-base ${isError ? 'feedback-error' : 'feedback-success'}`}
                    role="alert"
                >
                    {feedbackMessage}
                </div>
            )}

            <form onSubmit={handleHire} className="form-container">

                {/* ROW 1: First Name, Last Name, Email */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="input-label">First Name:</label>
                        <input type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="input-field" />
                    </div>
                    <div className="form-group">
                        <label className="input-label">Last Name:</label>
                        <input type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="input-field" />
                    </div>
                    <div className="form-group">
                        <label className="input-label">Email:</label>
                        <input type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field" />
                    </div>
                </div>

                {/* ROW 2: Phone, HireDate, Salary */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="input-label">Phone:</label>
                        <input type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input-field" />
                    </div>
                    <div className="form-group">
                        <label className="input-label">HireDate:</label>
                        <input type="date"
                            name="hireDate"
                            value={formData.hireDate}
                            onChange={handleChange}
                            className="input-field hire-date-field" />
                    </div>
                    <div className="form-group">
                        <label className="input-label">Salary:</label>
                        <input type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            className="input-field" />
                    </div>
                </div>

                {/* ROW 3: Job Selection (Linked Dropdowns) */}
                <div className="linked-dropdown-section">
                    <h3 className="section-title">Job:</h3>
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label className="input-label">JOB_ID:</label>
                            <select name="jobId"
                                value={formData.jobId}
                                onChange={handleJobChange}
                                className="input-field">
                                <option value="">-- Select Job ID --</option>
                                {jobs.map(job => (<option key={job.id} value={job.id}>{job.id}</option>))}
                            </select>
                        </div>
                        <div className="form-group half-width">
                            <label className="input-label">JOB_TITLE:</label>
                            <select name="jobTitle"
                                value={formData.jobTitle}
                                onChange={(e) => handleJobChange({ target: { value: jobs.find(j => j.title === e.target.value)?.id || '' } })} className="input-field">
                                <option value="">-- Select Job Title --</option>
                                {jobs.map(job => (<option key={job.title} value={job.title}>{job.title}</option>))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ROW 4: Manager Selection (Linked Dropdowns) */}
                <div className="linked-dropdown-section">
                    <h3 className="section-title">Manager:</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="input-label">Employee_id:</label>
                            <select name="managerId"
                                value={formData.managerId} onChange={handleManagerChange}
                                className="input-field">
                                <option value="">-- Select ID --</option>
                                {managers.map(manager => (<option key={manager.employee_id} value={manager.employee_id}>{manager.employee_id}</option>))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="input-label">First_Name:</label>
                            <select name="managerFirstName"
                                value={formData.managerFirstName}
                                onChange={(e) => handleManagerChange({ target: { value: managers.find(m => m.firstName === e.target.value)?.employee_id || '' } })} className="input-field">
                                <option value="">-- Select Name --</option>
                                {managers.map(manager => (<option key={manager.firstName} value={manager.firstName}>{manager.firstName}</option>))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="input-label">Last_Name:</label>
                            <select name="managerLastName"
                                value={formData.managerLastName}
                                onChange={(e) => handleManagerChange({ target: { value: managers.find(m => m.lastName === e.target.value)?.employee_id || '' } })} className="input-field">
                                <option value="">-- Select Name --</option>
                                {managers.map(manager => (<option key={manager.lastName} value={manager.lastName}>{manager.lastName}</option>))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ROW 5: Department Selection (Linked Dropdowns) */}
                <div className="linked-dropdown-section">
                    <h3 className="section-title">Department:</h3>
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label className="input-label">Department_Id:</label>
                            <select name="departmentId"
                                value={formData.departmentId}
                                onChange={handleDepartmentChange}
                                className="input-field">
                                <option value="">-- Select ID --</option>
                                {departments.map(dept => (<option key={dept.id}
                                    value={dept.id}>{dept.id}</option>))}
                            </select>
                        </div>
                        <div className="form-group half-width">
                            <label className="input-label">Department_Name:</label>
                            <select name="departmentName"
                                value={formData.departmentName}
                                onChange={(e) => handleDepartmentChange({ target: { value: departments.find(d => d.name === e.target.value)?.id || '' } })} className="input-field">
                                <option value="">-- Select Name --</option>
                                {departments.map(dept => (<option key={dept.name} value={dept.name}>{dept.name}</option>))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ROW 6: Buttons */}
                <div className="button-row">
                    <button type="button"
                        onClick={() => handleCancel(true)}
                        className="cancel-button"
                        disabled={isLoading}>
                        Cancel
                    </button>
                    <button type="submit"
                        className="hire-button"
                        disabled={isLoading}>
                        {isLoading ? 'Hiring...' : 'Hire'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default HiringForm