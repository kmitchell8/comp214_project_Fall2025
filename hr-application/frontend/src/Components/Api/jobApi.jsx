//Define Base URL matching your server.js routes
const JOB_URL = '/api/jobs'; 

//Authorization & Headers

// Helper to construct headers with the JWT token //leave this in for future reference but it will be set to null
                                                //when it is called
const getAuthHeaders = async (getToken ) => {
    //app allows public access currently so getToken = null currently //changes in a production site where there is a user schema/table
    const jwt = getToken  ? await getToken () : null; 
    
    const headers = {
        'Content-Type': 'application/json',
    };

    if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
    }
    
    return headers;
};

//Standard Fetch Helper
const fetchHelper = async (url, options) => {
    try {
        const response = await fetch(url, options);
        //Try to parse JSON, handle cases with no body//stops a potential crash
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            return data;
        } else {        //explicitly include details errorfield from     
            const errorMessage =  data.error || data.message || `API request failed with status: ${response.status}`;
            console.error('API call failed:', response.status, data);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Network or Authorization error:', error);
        throw error; 
    }
};

//Job CRUD Operations

//Create a new Job (Uses POST /api/jobs)
const create = async (jobData, getToken = null) => {//getToken set to Null
    const headers = await getAuthHeaders(getToken );
    
    return fetchHelper(JOB_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(jobData),
    });        
};

//List all Jobs (Uses GET /api/jobs)
const list = async (getToken = null) => {    
    //Auth headers added for when list route is protected
    const headers = await getAuthHeaders(getToken); 
    return fetchHelper(JOB_URL, {
        method: 'GET',
        headers: headers
    });       
};

//Read one Job (Uses GET /api/jobs/:id)
const read = async (jobId, getToken = null) => {
    const headers = await getAuthHeaders(getToken); 
    const url = `${JOB_URL}/${jobId}`;
    return fetchHelper(url, {
        method: 'GET',
        headers: headers
    });
};

//Update Job (Uses PUT /api/jobs/:id)
const update = async (jobId, jobData, getToken = null) => {
    const headers = await getAuthHeaders(getToken);
    const url = `${JOB_URL}/${jobId}`;
    return fetchHelper(url, {
        method: 'PUT',
        headers: headers, 
        body: JSON.stringify(jobData)
    });
};

//Delete Job (Uses DELETE /api/jobs/:id)
const remove = async (jobId, getToken = null) => {
    const headers = await getAuthHeaders(getToken );
    const url = `${JOB_URL}/${jobId}`;
    return fetchHelper(url, {
        method: 'DELETE',
        headers: headers,            
    });
};
/*
//Helper Data for Dropdowns (Managers only) // for future use

// Get Managers list (currently just calls the list all jobs endpoint)
const getManagers = async (getToken = null) => {
    //This assumes all listed jobs can potentially be managers
    //future use will separte managers' titles to discern and render precisely
    return list(getToken);
};
*/
export default { 
    create, 
    list, 
    read, 
    update, 
    remove,
    //Export for the Manager Dropdown
    /*getManagers*/
};