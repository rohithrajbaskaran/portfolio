import React from 'react';
import { FaLinkedin, FaGithub, FaEnvelope, FaInstagram } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer bg-black text-white py-3">
            <div className="container">
                <div className="row">
                    <div className="col text-center">
                        <p className="mb-0">
                            &copy; {new Date().getFullYear()} Rohithraj Baskaran. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

