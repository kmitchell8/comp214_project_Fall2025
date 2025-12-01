import React, { useState, useEffect, useCallback } from 'react'
//import { getHash } from '../Api/getPage.jsx'
import EmployeeList from '../List/EmployeeList.jsx'
import HiringForm from '../Form/HiringForm.jsx';


const EmployeeView = ({ pathSegments: parentSegments = [] }) => {

    //logic to determine the initial view based on the URL hash
    const getInternalView = useCallback(() => {
        const internalSegment = parentSegments[1];
        if (internalSegment === 'list') {
            return 'list';
        }

        // If the path is just '#/employee' or '#/employee/form', default to form.
        if (!internalSegment || internalSegment === 'form') {

            //Ensure the hash is correctly set to include the full path
            //if the user navigated to '#employee', it's changed to '#employee/form'
            if (parentSegments.join('/') !== 'employee/form') {
                window.location.hash = 'employee/form';
            }
            return 'form';
        }
        // Default to form if the segment is unrecognized, but ensure the hash is fixed.
        window.location.hash = 'employee/form';
        return 'form';

    }, [parentSegments]);//dependency (parentSegment): the view depends on the state of the parent page

    const [currentView, setCurrentView] = useState(getInternalView);

    //!IMPORTATNT Effect to set initial state on load
    useEffect(() => {
        setCurrentView(getInternalView());
    }, [getInternalView]);

    //const [currentView, setCurrentView] = useState(getInitialView);

    //listen for hash changes and update the state
    //handled by the PageView component
    /*useEffect(() => {
        const handleHashChange = () => {
            const { segments: newSegments } = getInitialView();
            setPathSegments(newSegments);
        };

        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [getInitialView]);*/


    //conditional rendering
    const renderView = () => {

        switch (currentView) {
            case 'list':
                //EmployeeList can use parentSegments to check for further nesting (e.g., list/view/100)
                return <EmployeeList pathSegments={parentSegments} />;
            case 'form':
            default:
                return <HiringForm />;
        }
    };
    //Helper component for navigation buttons
    const NavigationLinks = () => {
        return (
            //Keeping container styling for layout purposes (Tail Wind CSS)
            <div className="flex justify-center space-x-4 p-4 border-t border-gray-200 mt-6 bg-gray-50 rounded-b-lg">
                {currentView !== 'list' && (
                    <button onClick={() => window.location.hash = 'employee/list'}
                    className="button-group"
                    >
                        View Employee List
                    </button>
                )}
                {currentView !== 'form' && (
                    <button onClick={() => window.location.hash = 'employee/form'}
                    className="button-group"
                    >
                        Go to Hiring Form
                    </button>
                )}
            </div>
        );
    };
    return (
        <div className="min-h-screen"> {/*tail-wind css min-h(min-height) and screen(100vh)*/}

            <main className="render-view">
                <NavigationLinks />
                {renderView()}
                <NavigationLinks />
            </main>
        </div>
    );
};


export default EmployeeView