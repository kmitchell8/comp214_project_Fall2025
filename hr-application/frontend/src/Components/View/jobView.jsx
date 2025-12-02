import React, { useState, useEffect, useCallback } from 'react'
//import './Job.css'
import '../../index.css'
import SearchJob from '../Job/SearchJob.jsx'
//import UpdateJob from './UpdateJob'
import CreateJob from '../Form/CreateJob.jsx'//Form for creating a new job
import JobList from '../List/JobList.jsx'
import { getHash } from '../Api/getPage.jsx'

//Another method to embed a view inside a view //simply get the hash from the subview itself instead of passng it from the main primary view
const Job = () => {
  const getInitialSubView = useCallback(() => {
    const hash = getHash();
    const segments = hash.split('/').filter(s => s !== '');
    return segments[1] || 'list'; // Default to 'list' if no sub-view specified
  }, []);

  const [currentSubView, setCurrentSubView] = useState(getInitialSubView);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentSubView(getInitialSubView());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [getInitialSubView]);

  const NavigationLinks = () => {
    return (
      <div>
        {currentSubView !== 'list' && (
          <button onClick={() => window.location.hash = 'job'}
            className="button-group"
          >
            Go Back
          </button>
        )}
      </div>
    );
  };
  const renderSubView = () => {
    switch (currentSubView) {
      case 'search':
        return <SearchJob />;
      case 'update':
        return <JobList />;
      case 'create':
        return <CreateJob />;
      case 'list':
      default:
        return (
          <div className='job-container'>
            <div className='job'>
              <h3>
                <a href="#/job/search">Search a Job</a>
              </h3>
            </div>
            <div className='job'>
              <h3>
                <a href="#/job/update">Update a Job</a>
              </h3>
            </div>
            <div className='job'>
              <h3>
                <a href="#/job/create">Create a Job</a>
              </h3>
            </div>
          </div>
        );
    }
  };
  return (
    <div className="min-h-screen"> {/*tail-wind css min-h(min-height) and screen(100vh)*/}

      <main className="render-view">
        {renderSubView()}
        <NavigationLinks />
      </main>
    </div>
  );
  // return <>{renderSubView()}</>;
}

export default Job