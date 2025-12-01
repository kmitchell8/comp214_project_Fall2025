import React, { useState } from 'react';

const SearchJob = () => {
    const [jobId, setJobId] = useState('');
    const [jobData, setJobData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!jobId.trim()) {
            setError('Please enter a job ID');
            return;
        }

        setLoading(true);
        setError('');
        setJobData(null);

        try {
            const response = await fetch(`/api/jobs/${jobId}`);
            if (!response.ok) {
                throw new Error('Job not found');
            }
            const data = await response.json();
            setJobData(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch job data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Search Job</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Enter Job ID"
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    style={{ padding: '8px', marginRight: '10px', width: '200px' }}
                />
                <button onClick={handleSearch} style={{ padding: '8px 16px' }}>
                    Search
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loading && <p>Loading...</p>}

            {jobData && (
                <div style={{ border: '1px solid #ccc', padding: '15px' }}>
                    <h3>Job Details</h3>
                    <p><strong>Job ID:</strong> {jobData.JOB_ID}</p>
                    <p><strong>Job Title:</strong> {jobData.JOB_TITLE}</p>
                    <p><strong>Min Salary:</strong> ${jobData.MIN_SALARY}</p>
                    <p><strong>Max Salary:</strong> ${jobData.MAX_SALARY}</p>
                </div>
            )}
        </div>
    );
};

export default SearchJob;