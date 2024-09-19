import React from 'react'
import { FaLinkedin, FaGithub, FaEnvelope, FaInstagram, FaPhoneAlt} from 'react-icons/fa';

const ContactMe = () => {
  
  return (
    <main id='home' className="mx-lg-auto mx-3 mb-lg-4 mb-0 pb-5 d-flex flex-column justify-content-lg-center justify-content-start align-items-start navbar-custom-width">
      <h1 className='mb-3 fw-bolder align-self-start'>Connect with me</h1>
      <hr className='mt-0'/>
      <p className='text-md-start text-center align-self-start'>Let's talk more! I prefer you calling but email or any socials will work too.</p>
      <div className='d-flex flex-lg-row flex-column mt-3'>
        
          
        <div className='d-flex flex-md-row flex-column align-items-start ps-lg-0 ps-4'>
          <div>
            <div className='pe-5 mb-4 d-flex align-items-center justify-content-start'>
              <FaPhoneAlt size={50}></FaPhoneAlt>
              <p className='ms-5 mb-0'>+16474254850</p>
            </div>
            <div className='pe-5 mb-4 d-flex align-items-center justify-content-start'>
              <FaEnvelope size={50}></FaEnvelope>
              <a target='#' href='mailto:baskaranrohithrajl@gmail.com'><p className='ms-5 mb-0'>Email - Rohithraj Baskaran</p></a>
            </div>
            
          </div>
          <div>
            <div className='pe-5 mb-4 d-flex align-items-center justify-content-start'>
              <FaLinkedin size={50}></FaLinkedin>
              <a target='#' href='https://www.linkedin.com/in/rohithraj-baskaran-89029820b/'><p className='ms-5 mb-0'>Linkdin - Rohithraj Baskaran</p></a>
            </div>
            <div className='pe-5 mb-4 d-flex align-items-center justify-content-start'>
              <FaInstagram size={50}></FaInstagram>
              <a target='#' href='https://www.instagram.com/rohithr.b/'><p className='ms-5 mb-0'>Instagram - Rohithraj Baskaran</p></a>
            </div>
          </div>
          <div>
            <div className='pe-5 mb-4 d-flex align-items-center justify-content-start'>
              <FaGithub size={50}></FaGithub>
              <a target='#' href='https://github.com/rohithrajbaskaran'><p className='ms-5 mb-0'>Git Hub - Rohithraj Baskaran</p></a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ContactMe
