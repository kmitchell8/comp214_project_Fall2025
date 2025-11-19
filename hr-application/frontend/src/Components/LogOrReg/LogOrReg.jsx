import React, { useState, useEffect } from 'react'
import './LogOrReg.css'
import { signIn, signUp } from '../Api/authApi';
import { useAuth } from '../authState/useAuth';
import {getPage} from '../Api/getPage.jsx'


const LogOrReg = () => {
  //state to hold form data
  const { isAuthenticated } = useAuth();
  //const { register } = useAuth();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  //getting a usable string from the function
  const getPageString = getPage();
  //Logic to ensure user does not get to the login/regster pages if logged in
  useEffect(() => {
    if (isAuthenticated && (getPageString === 'login' || getPageString === 'register')) {
      console.log(`User is Logged in. Redirecting from ${getPageString} page to homepage.`);
      window.location.replace('./');
    }
  }, [isAuthenticated, getPageString]);
  //If statement to ensure the form does not render if on the 
  //home page and logged in (can be set to any page)
  //needs to be updated to coincide with the page the component is on
  if (getPageString === 'index' && isAuthenticated) {
    return null;
  }


  const handleSubmit = async (e/*submitAction*/) => {
    e.preventDefault();
    const submitAction = e.nativeEvent.submitter.value;
    
    setError(null);
    setLoading(true); //sets loading state to true

    try {
      if (submitAction === 'register') {
        await signUp(name, email, password);
        window.location.replace('./signin.html');

      }
      if (submitAction == 'signin') {

        const data = await signIn(email, password);
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        login(data.user);


      }
    } catch (err) {
      const action = submitAction === 'Registration' ? 'Registration' : 'Login';
      console.error(`${action} error:`, err.message);
      setError(err.message || `${action} failed.`);

    } finally {
      setLoading(false);
    }
  };


 
  return (
    <div className='form-container'>
      <div className="form-card">

        {/*<h1 className="form-header">
          Sign Up
        </h1>*/}

        {error && (
          <div className="form-error" role="alert">
            <span className="error-message">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">

          {/*input fields laid out for ease of view and debugging / do not change*/}
          {/*name/username input field*/}
          <div className="input-group">
            <label htmlFor="name" className="input-label">Username</label>
            <input
              type="text"
              id="name"
              placeholder="Type your username"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}//updates the 'value" as the user enters
              //details in the input field in a synchronised way
              disabled={loading}
            />
          </div>

          {/* email input field*/}
          <div className="input-group">
            <label htmlFor="email" className="input-label">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Type your email"
              className="input-field"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* password input field*/}
          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Type your password"
              className="input-field"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className='button-container'>
            {/*Login Button*/}
            <button
              type="submit"
              className="login-button split-left"
              disabled={loading}
              name="action" //name binds the two buttons together
              value="signin" //differentiate what each button will do based on the value
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/*Signup Button*/}
            <button type="submit"
              className="register-button split-right"
              disabled={loading}
              name="action"
              value="register"
            >
              {loading ? 'Regiseter...' : 'Sign Up'}
            </button>
          </div>

        </form>
      </div>

    </div>)
}

export default LogOrReg