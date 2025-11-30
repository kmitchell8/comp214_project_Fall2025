import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import App from './App.jsx'
import { PageView } from './Components/authState/Pageview'

createRoot(document.getElementById('root')).render(
  <StrictMode>    
     <PageView/>    
  </StrictMode>,
)