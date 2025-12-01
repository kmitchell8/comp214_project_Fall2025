import React, { useState, useEffect, useCallback } from 'react'
import './Job.css'
import SearchJob from './SearchJob'
import UpdateJob from './UpdateJob'
import CreateJob from './CreateJob'
import JobList from './JobList'
import { getHash } from '../Api/getPage.jsx'

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

  const renderSubView = () => {
    switch (currentSubView) {
      case 'searchJob':
        return <SearchJob />;
      case 'updateJob':
        return <JobList />;
      case 'createJob':
        return <CreateJob />;
      case 'list':
      default:
        return (
          <div className='job-container'>
            <div className='job'>
              <h3>
                <a href="#/job/searchJob">Search a Job</a>
              </h3>
            </div>
            <div className='job'>
              <h3>
                <a href="#/job/updateJob">Update a Job</a>
              </h3>
            </div>
            <div className='job'>
              <h3>
                <a href="#/job/createJob">Create a Job</a>
              </h3>
            </div>
          </div>
        );
    }
  };

  return <>{renderSubView()}</>;
}

export default Job