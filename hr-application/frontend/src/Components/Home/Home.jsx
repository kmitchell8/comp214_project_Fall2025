import React from 'react'
import './Home.css'
import LogOrReg from '../LogOrReg/LogOrReg'
import { AuthProvider } from '../authState/authProvider'


const Home = () => {
  return (
    <div className='home'>
      <AuthProvider>
        <LogOrReg />
      </AuthProvider>

      <p>Home Page: Start Building Here</p>

    </div>)
}

export default Home