import React, { useState } from 'react'

import JsLogo from '../assets/js_logo.png'
import ReactLogo from '../assets/react_logo.png'
import NodeLogo from '../assets/node_logo.png'
import ExpressLogo from '../assets/express_logo.png'
import PostgresLogo from '../assets/postgres_logo.png'
import HtmlLogo from '../assets/html_logo.png'
import CssLogo from '../assets/css_logo.png'
import MangoLogo from '../assets/mango_logo.png'
import PythonLogo from '../assets/python_logo.png'
import ReduxLogo from '../assets/redux_logo.png'
import RustLogo from '../assets/rust_logo.png'
import JavaLogo from '../assets/java_logo.png'
import CLogo from '../assets/c_logo.png'
import HaskallLogo from '../assets/haskall_logo.png'
import FireBaseLogo from '../assets/firebase_logo.png'
import JWTlLogo from '../assets/jwt_logo.png'
import OAuthLogo from '../assets/oauth_logo.png'
import MatPlotLibLogo from '../assets/matplotlib_logo.png'
import BootstrapLogo from '../assets/bootstrap_logo.png'
import GitLogo from '../assets/git_logo.png'
import GitHubLogo from '../assets/github_logo.png'
import LinuxLogo from '../assets/linux_logo.png'
import FigmaLogo from '../assets/figma_logo.png'

import { BsTools } from "react-icons/bs";
import { FaBook } from "react-icons/fa6";
import { GrCertificate } from "react-icons/gr";
import { MdOutlineWorkOutline } from "react-icons/md";

import { PiNumberCircleOneFill } from "react-icons/pi";
import { PiNumberCircleOneLight } from "react-icons/pi";

import { PiNumberCircleTwoLight } from "react-icons/pi";
import { PiNumberCircleTwoFill } from "react-icons/pi";

const AboutMe = () => {
    const [activeAbout, setActiveAbout] = useState('Experience')

    const frontendLogos = [HtmlLogo, CssLogo, JsLogo, ReactLogo, ReduxLogo, BootstrapLogo]
    const backendLogos = [NodeLogo, ExpressLogo, PostgresLogo, MangoLogo, OAuthLogo, JWTlLogo, FireBaseLogo]
    const otherLanguages = [PythonLogo, HaskallLogo, CLogo, JavaLogo, RustLogo]
    const otherFrameWorks = [GitLogo, GitHubLogo, LinuxLogo, FigmaLogo, MatPlotLibLogo]

    const [activeAboutExperience, setActiveAboutExperience] = useState('first');

    const experiencesData = [
        {
            heading: 'Freelance Software Developer',
            description:
                <>
                    <li>Was a part of 5 software developers, developing a React website for a company which improved workflow by 30% and implemented lazy loading and code splitting, improving load time by 35% across all devices.</li>
                    <li>Implement RESTFful APIs that reduced response time by 20% and allowing real-time data synchronization across all platforms.</li>
                    <li>ted robust user authentication systems for admins using JWT and OAuth ensuring secure access controls and utilized Stripe API for a seamless payment processing along with Redux for global state management for improved scalability and reducing redundancy.</li>
                </>
        },
        {
            heading: 'Quality Assurance Intern',
            description:
                <div>
                    <li>Conducted thorough and detailed manual user testing, carefully analyzing software programs, websites and other items to judge their usability and functionality..</li>
                    <li>Generated comprehensive feedback reports, identifying usability problems and proposing actionable  solutions to enhance user experiences.</li>
                    <li>Worked with multiple business units, ensuring test cases met business needs and ensured smoother release process.</li>
                </div>
        },
    ]

    const handleActive = (e) => {
        const targetElement = e.target.closest('[dataId]');
        if (targetElement) {
            const dataId = targetElement.getAttribute('dataId');
            setActiveAbout(dataId);
        }
    };
  
    return (
        <div className='mx-lg-auto mx-3 pe-lg-0 pe-5 d-flex flex-column justify-content-lg-center justify-content-center align-items-start navbar-custom-width'>
            <div className='d-flex'>
                <h1 className='fw-bolder '>{activeAbout}</h1>
            </div>
            
            <hr className='my-0' />
            <about className="mx-lg-auto mb-0 mx-0 px-0 d-flex flex-lg-row flex-column justify-content-start align-items-center navbar-custom-width mt-3">
                
                <div className='mt-2 mt-lg-0 px-3 px-lg-5 py-2 mb-4 mb-lg-0 py-lg-5 me-lg-5 d-flex flex-lg-column bg-black text-white about-me-custom'>

                    <h6 dataId='Experience' className={`me-lg-0 hover p-2 ps-lg-3 ps-2 mb-lg-0 mb-0 text-wrap skills-nav1 ${activeAbout === 'Experience' && 'text-info border border-info rounded-pill'}`} onClick={handleActive}>
                        Experience
                    </h6>
                    <div dataId='Experience' onClick={handleActive} className={`me-lg-0 hover p-2 ps-lg-3 ps-2 mb-lg-0 mb-0 text-wrap skills-nav2 ${activeAbout === 'Experience' && 'text-info border border-info rounded-pill'}`}>
                        <MdOutlineWorkOutline ></MdOutlineWorkOutline>
                    </div>
                    <h6 dataId='Skills' className={`mt-lg-5 p-2 hover ps-lg-3 ps-2 mb-lg-0 mb-0 skills-nav1 ${activeAbout === 'Skills' && 'text-info border border-info rounded-pill'}`} onClick={handleActive}>
                        Skills
                    </h6>
                    <div dataId='Skills' onClick={handleActive} className={`me-lg-0 hover p-2 ps-lg-3 ps-2 mb-lg-0 mb-0 text-wrap skills-nav2 ${activeAbout === 'Skills' && 'text-info border border-info rounded-pill'}`} >
                        <BsTools></BsTools>
                    </div >
                    
                    <h6 dataId='Qualification' className={`mt-lg-5 me-lg-0 p-2 ps-lg-3 ps-2 hover mb-lg-0 mb-0 skills-nav1 ${activeAbout === 'Qualification' && 'text-info border border-info rounded-pill'}`} onClick={handleActive}>
                        Qualification
                    </h6> 
                    <div dataId='Qualification' onClick={handleActive} className={`me-lg-0 hover p-2 ps-lg-3 ps-2 mb-lg-0 mb-0 text-wrap skills-nav2 ${activeAbout === 'Qualification' && 'text-info border border-info rounded-pill'}`}>
                        <FaBook></FaBook>
                    </div>
                    <h6 dataId='Certifications' className={`mt-lg-5 p-2 hover ps-lg-3 ps-2 mb-lg-0 mb-0 skills-nav1 ${activeAbout === 'Certifications' && 'text-info border border-info rounded-pill'}`} onClick={handleActive}>
                        Certifications
                    </h6>
                    <div dataId='Certifications' onClick={handleActive} className={`me-lg-0 me-0 hover p-2 ps-lg-3 ps-2 mb-lg-0 mb-0 text-wrap skills-nav2 ${activeAbout === 'Certifications' && 'text-info border border-info rounded-pill'}`} >
                        <GrCertificate ></GrCertificate>
                    </div>
                    
                    
                </div>

                <div className='d-flex flex-column justify-content-center align-items-center me-lg-5 mx-4 mx-lg-2 pe-lg-2 pe-0 mb-lg-0 mb-4'>
                    
                    {activeAbout === 'Skills' &&
                        <>
                            <div className='d-flex flex-lg-column flex-md-row flex-column'>
                                <div className='d-flex flex-md-row flex-column justify-content-start mb-0 mb-lg-4'>
                                
                                    <div className='me-lg-5 me-3 mb-md-0 mb-4'>
                                        <h5 className='mb-4'>Frontend Web Development:</h5>
                                        <div>
                                            {frontendLogos.map((logo, index) => (<img key={index} src={logo} className='icons-custom mt-1' />))}
                                        </div>
                                        
                                    </div>

                                    <div className='me-lg-1 me-3 mb-md-0 mb-4'>
                                        <h5 className='mb-4'>Backend Web Development:</h5>
                                        <div>
                                            {backendLogos.map((logo, index) => (<img key={index} src={logo} className='icons-custom mt-1' />))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className='d-flex flex-md-row flex-column justify-content-start mb-4'>
                                    <div className='me-lg-5 me-3 mb-md-0 mb-4'>
                                        <h5 className='mb-4'>Other Languages:</h5>
                                        <div>
                                            {otherLanguages.map((logo, index) => (<img key={index} src={logo} className='icons-custom mt-1' />))}
                                        </div>
                                    </div>

                                    <div className='me-lg-1 me-3 mb-md-0 mb-4'>
                                        <h5 className='mb-4'>Other Frameworks:</h5>
                                        <div>
                                            {otherFrameWorks.map((logo, index) => (<img key={index} src={logo} className='icons-custom mt-1' />))}
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                        </>
                        }
                    {activeAbout === 'Qualification' &&
                        <div className='mb-3'>
                            <p>BSc Computer Science - Toronto Metropolitan University (formerly known as Ryerson)</p>
                            <li>Expected graduation: Summer 2025</li>
                            <li>GPA: 3.80</li>
                            <li>Relevant Course Concepts - Object Oriented Programming, Data Structures and Algorithms, Linear Algebra,
Calculus, Computer Architecture, Discrete Structures.</li>
                        </div>}
                    {activeAbout === 'Certifications' && <p>Under Construction</p>}

                    {(activeAbout === 'Experience' && activeAboutExperience === 'first') &&
                        
                        <div className='d-flex flex-column align-items-center'>
                            
                            <div className='mb-3'>
                                <h5>{experiencesData[0].heading}</h5>
                                {experiencesData[0].description}
                            </div>
                            <div className='mt-3'>
                                <PiNumberCircleOneFill className='experience-button' onClick={() => setActiveAboutExperience('first')} />
                                <PiNumberCircleTwoLight className='experience-button' onClick={() => setActiveAboutExperience('second')} />
                            </div>
                            
                            
                        </div>}
                    
                    {(activeAbout === 'Experience' && activeAboutExperience === 'second') &&
                        <div className='d-flex flex-column align-items-center'>
                            
                            <div className='mb-3'>
                                <h5>{experiencesData[1].heading}</h5>
                                {experiencesData[1].description}
                            </div>
                            <div className='mt-3'>
                                <PiNumberCircleOneLight className='experience-button' onClick={() => setActiveAboutExperience('first')} />
                                <PiNumberCircleTwoFill className='experience-button' onClick={() => setActiveAboutExperience('second')} />
                            </div>
                            
                        </div>}
                </div>    
            </about>
        </div>
  )
}

export default AboutMe

