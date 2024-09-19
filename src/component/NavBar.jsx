import React from 'react'
import { NavLink } from 'react-router-dom'
import Logo from '../assets/logo.png'

const NavBar = () => {
  return (
    <nav className="navbar navbar-expand-lg fixed-top" style={{ backgroundColor: 'black' }} data-bs-theme="dark">
      <div className="container-fluid mx-auto ps-2" style={{width: "1000px"}}>
        <div className='logo'>
            <NavLink to='/'><img src={Logo} alt='Logo' className='logo'/></NavLink>
        </div>
        <div>
              <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                  <span className="navbar-toggler-icon"></span>
              </button>
            <div className="offcanvas offcanvas-end" style={{width: "350px"}} id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
            <div className="offcanvas-header">
            <a className="nav-link ps-4" href='#home'><img src={Logo} alt='Logo' className='logo' /></a>
                          
            </div>                
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                    <a className="nav-link ps-4" href='#home'>Home</a>
                          </li>
                          <li className="nav-item">
                          <a className="nav-link ps-4" href='#about'>About Me</a>
              </li>
              <li className="nav-item">
                <a className="nav-link ps-4" href='#projects'>Projects</a>
                          </li>
              <li className="nav-item">
                <a className="nav-link ps-4" href='#contact'>Contact Me</a>
                    </li>
                    
                          
                          
                </ul>
            </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar

