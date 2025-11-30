import React from 'react'
import './Navbar.css'
//import hr_logo from '../../../public/images/hr_logo.png'


const Navbar = () => {

    return (
        <nav className="navbar">
            <div className="logo">
                <a href="./"><img src="/images/hr_logo.png" height="50px" width="50px" alt="" /></a>
            </div>
            <ul className="nav-menu">
                    {/* Common link for all views */}
                    <li><a href="./">Home</a></li>
                    <li><a href="./#employee">Employee Main Menu</a></li>
                    <li><a href="./#job">Jobs Main Menu</a></li>
                    <li><a href="./#department">Departments Main Menu</a></li>
                </ul>
           
        </nav>
    )
}

export default Navbar