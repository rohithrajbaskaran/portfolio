import React from 'react'
import PlacehlderImage from '../assets/placeholder_image.jpg'
import RandomImage from '../assets/random.png'
import JobTracker from '../assets/JobTracker.png'
import Snake from '../assets/Snake.png'
import Auth from '../assets/Auth.png'
import Finance from '../assets/Finance.png'

const Projects = () => {

    const projects = [
        {
            image: <img src={JobTracker} className='projects-image' />,
            date: 'August 2024',
            link: 'https://lively-sprinkles-f81885.netlify.app',
            title: 'JobTracker.io',
            tech: 'React.js, Express.js, PostgreSQL, Node.js',
            description: 'Allows users to keep track of their job applications status',
        },
        {
            image: <img src={Auth} className='projects-image' />,
            date: 'August 2024',
            link: 'https://github.com/rohithrajbaskaran/aunthentication-Express',
            title: 'Authentication',
            tech: 'Express.js, JWT and OAuth',
            description: "Designed and implemented a user aunthetication system",
        },
        {
            image: <img src={Finance} className='projects-image' />,
            date: 'August 2024',
            link: 'https://github.com/rohithrajbaskaran/financeTracker-React',
            title: 'Chartpense',
            tech: 'React.js, Chart.js',
            description: "A finance visualizing application",
        },
        {
            image: <img src={Snake} className='projects-image' />,
            date: 'August 2024',
            link: 'https://github.com/rohithrajbaskaran/snakegame-Python',
            title: 'Hiss',
            tech: 'Python, Turtle',
            description: "A snake game that varies in diffculty",
        },
    ]

    return (
        <main id='home' className="mx-lg-auto mx-3 d-flex flex-column justify-content-lg-center justify-content-center align-items-start projects-custom-width">
            <h1 className='fw-bolder text-start'>Projects</h1>
            <hr className='mt-0'/>

            <div className='d-flex flex-lg-row flex-column mt-lg-3 mt-2'>
                <div className='d-flex flex-wrap justify-content-start '>
                    {projects.map((project, index) => (
                        <div className='d-flex flex-column justify-content-start align-items-lg-start align-items-center mx-2 card p-3 py-4 mb-2 '>
                            <div id={index} >
                                {project.image}
                            </div>
                            <div className='mb-2' style={{width: '200px', maxWidth: '100%'}}>
                                <h5 className='mb-2 mt-4 text-lg-start text-center'>{project.title}</h5>
                                <p className='my-2 text-lg-start text-center'><i>{project.tech}</i></p>
                                <p className='my-2 text-lg-start text-center'><i>{project.date}</i></p>
                                <p className='my-2 text-lg-start text-center'>{project.description}</p>
                            </div>
                            <a href={project.link} target='#'><button className='btn btn-outline-dark'>More Details</button></a>
                        </div>
                    )
                    )}
                </div>
            </div>
        </main>
  )
}

export default Projects
