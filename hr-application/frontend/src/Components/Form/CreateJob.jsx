import React, { useState } from 'react';
import './Form.css'

const CreateJob = () => {
    const [formData, setFormData] = useState({
        jobId: '',
        jobTitle: '',
        minSalary: '',
        maxSalary: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        console.log('Submitting form data:', formData);
        if (!formData.jobId.trim()) {
            setError('Job ID is required');
            return;
        }
        if (!formData.jobTitle.trim()) {
            setError('Job title is required');
            return;
        }

        if (!formData.minSalary || !formData.maxSalary) {
            setError('Both salary fields are required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobId: formData.jobId,
                    jobTitle: formData.jobTitle,
                    minSalary: parseFloat(formData.minSalary),
                    maxSalary: parseFloat(formData.maxSalary)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create job');
            }

           // const data = await response.json(); //Not currently in use (in case of submit failure check line)
            setSuccess(`Job created successfully! Job ID: ${formData.jobId}`);
            setFormData({
                jobId: '',
                jobTitle: '',
                minSalary: '',
                maxSalary: ''
            });
        } catch (err) {
            setError(err.message || 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='job-form'>
            <h2 className='form-title'>Create New Job</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {loading && <p>Creating job...</p>}

            <div className='form-container'>
                <div className='form-row'>
                    <label className='input-label'>Job ID: </label>
                    <input
                        type="text"
                        name="jobId"
                        value={formData.jobId}
                        onChange={handleInputChange}
                        className='input-field'
                        placeholder="Enter job ID"
                    />
                </div>
                <div className='form-row'>
                    <label className='input-label'>Job Title: </label>
                    <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className='input-field'
                        placeholder="Enter job title"
                    />
                </div>
                <div className='form-row'>
                    <label className='input-label'>Min Salary: </label>
                    <input
                        type="number"
                        name="minSalary"
                        value={formData.minSalary}
                        onChange={handleInputChange}
                        className='input-field'
                        placeholder="Enter minimum salary"
                    />
                </div>
                <div className='form-row'>
                    <label className='input-label'>Max Salary: </label>
                    <input
                        type="number"
                        name="maxSalary"
                        value={formData.maxSalary}
                        onChange={handleInputChange}
                        className='input-field'
                        placeholder="Enter maximum salary"
                    />
                </div>
                <div className='button-row'>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className='create-button'
                    >
                        {loading ? 'Creating...' : 'Create Job'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateJob;
