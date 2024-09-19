import { useState, useEffect } from 'react'
import './App.css'
import NavBar from './component/NavBar'
import Me from './assets/me.png'
import AboutMe from './component/AboutMe'
import { useLocation } from 'react-router-dom'
import ContactMe from './component/ContactMe'
import Projects from './component/Projects'
import Footer from './component/Footer'

import Resume from './assets/RB.pdf'

function App() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.substring(1)); 
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return (
    <>
      <NavBar />
      <main id='home' className="mx-auto ps-2 d-flex flex-lg-row flex-column justify-content-lg-between justify-content-between align-items-center custom-div-1">
        <div className='mt-lg-5 mt-4 pt-lg-3 pt-0'>
          <img className='image-custom' src={Me} alt="Me" />
        </div>
        <div className='d-flex flex-column align-items-lg-start align-items-center justify-content-center mt-lg-5 mt-4 pt-lg-5 pt-0 ms-lg-5 mx-0'>
          <div className='mb-lg-2 mb-2 px-2 text-lg-start text-center'>
            <h1><b>Rohithraj Baskaran</b></h1>
            <h2>Passionate about <b>Software Development</b></h2>
            <p>Leveraging industry led technologies to create innovative solutions in software development and sustainability.</p>
          </div>
          <div className='mt-lg-3 mt-1 d-flex'>
            <a href='#contact'><button className='me-2 btn btn-outline-dark'>Contact me</button></a>
            <a href={Resume} target='#'><button className='btn btn-outline-dark'>View Resume</button></a>
          </div>
        </div>
      </main>

      <div id='about' className='custom-div-2' style={{height: '50px'}}>
        
      </div>
      <AboutMe />
      

      <div id='projects' className='custom-div-3' style={{height: '60px'}}>
        
      </div>
      
      <Projects></Projects>
      <div id='contact' className='custom-div-4' style={{height: '60px'}}>
        
      </div>
      <ContactMe></ContactMe>

      <Footer></Footer>
    </>
  );
}

export default App;