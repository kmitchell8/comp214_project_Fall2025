import React, { useState, useEffect, useCallback } from 'react'
import { getHash } from '../Api/getPage.jsx'
import Navbar from '../Navbar/Navbar.jsx'
import Home from '../Home/Home.jsx'
//import Employee from '../Employee/Employee.jsx'
import Job from '../Job/Job.jsx'
import Department from '../Department/Department.jsx'
import EmployeeView from '../authState/EmployeeView.jsx'


export const PageView = () => {

    // logic to determine the initial view based on the URL hash
    const getInitialView = useCallback(() => {
        const hash = getHash();

        
        ////Do not lose code: This code is a concise way to handle nested views as nested hashes 
        //!VERY IMPORTANT. the hash gets split into an array and that array is then checked
        //Split the hash once into all segments and get the primary key Pageview. The code looks at the primary segment
        //and in Employeeview the code looks at the second segment [1]
        //Filter out empty strings if the hash is just '#'
        //All of this is passed to employeeview from pageview through the Employeeview arugements
        
        const segments = hash.split('/').filter(s => s !== '');
        const primarySegment = segments[0];

        if (!primarySegment || primarySegment === 'home') {
            //If no hash or just 'home', ensure hash is set correctly for clean routing
            if (hash !== 'home') {
                window.location.hash = 'home';
            }
            return { view: 'home', segments };
        }

        //Assign value to primary segment that is either employee, job or department
        //makes the Pageview resuable for all pages that have a nested view inside the
        //parent page view
        if (['employee', 'job', 'department'].includes(primarySegment)) {
            return { view: primarySegment, segments };
        }
        window.location.hash = 'home';
        return { view: 'home', segments };

    }, []);

    //State stores both the primary view key and the full path segments
    const [viewData, setViewData] = useState(getInitialView);
    const { view: currentView, segments: pathSegments } = viewData;


    // listen for hash changes and update the state
    useEffect(() => {
        const handleHashChange = () => {
            // Update state with new view and segments
            setViewData(getInitialView());
        };

        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [getInitialView]);

    // conditional rendering
    const renderView = () => {
        switch (currentView) {
            case 'employee':
                //Pass the path segments down. This is essential for the nested router (EmployeeView)
                //to correctly determine its internal view (e.g., 'form' or 'list').
                return <EmployeeView pathSegments={pathSegments} />;
            case 'job':
                return <Job />;
            case 'department':
                return <Department />;
            case 'home':
            default:
                return <Home />;
        }
    };

    return (
        <div className="min-h-screen"> {/*tail-wind css min-h(min-height) and screen(100vh)*/}
            <Navbar />
            <main className="render-view">
                {renderView()}
            </main>
        </div>
    );
};
