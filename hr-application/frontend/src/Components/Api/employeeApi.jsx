//Define Base URL matching your server.js routes
const EMPLOYEE_URL = '/api/employees'; 

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
        } else {            
            const errorMessage = data.error || data.message || `API request failed with status: ${response.status}`;
            console.error('API call failed:', response.status, data);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Network or Authorization error:', error);
        throw error; 
    }
};

//Employee CRUD Operations

//Create a new Employee (Uses POST /api/employees)
const create = async (employeeData, getToken = null) => {//getToken set to Null
    const headers = await getAuthHeaders(getToken );
    
    return fetchHelper(EMPLOYEE_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(employeeData),
    });        
};

//List all Employees (Uses GET /api/employees)
const list = async (getToken = null) => {    
    //Auth headers added for when list route is protected
    const headers = await getAuthHeaders(getToken); 
    return fetchHelper(EMPLOYEE_URL, {
        method: 'GET',
        headers: headers
    });       
};

//Read one Employee (Uses GET /api/employees/:id)
const read = async (employeeId, getToken = null) => {
    const headers = await getAuthHeaders(getToken); 
    const url = `${EMPLOYEE_URL}/${employeeId}`;
    return fetchHelper(url, {
        method: 'GET',
        headers: headers
    });
};

//Update Employee (Uses PUT /api/employees/:id)
const update = async (employeeId, employeeData, getToken = null) => {
    const headers = await getAuthHeaders(getToken);
    const url = `${EMPLOYEE_URL}/${employeeId}`;
    return fetchHelper(url, {
        method: 'PUT',
        headers: headers, 
        body: JSON.stringify(employeeData)
    });
};

//Delete Employee (Uses DELETE /api/employees/:id)
const remove = async (employeeId, getToken = null) => {
    const headers = await getAuthHeaders(getToken );
    const url = `${EMPLOYEE_URL}/${employeeId}`;
    return fetchHelper(url, {
        method: 'DELETE',
        headers: headers,            
    });
};
/*
//Helper Data for Dropdowns (Managers only) // for future use

// Get Managers list (currently just calls the list all employees endpoint)
const getManagers = async (getToken = null) => {
    //This assumes all listed employees can potentially be managers
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