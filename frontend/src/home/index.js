import React from 'react';

import '../App.css';
import '../static/css/home/home.css';

export default function Home() {
    return (
        <div className="home-page-container">

            <section className="hero-section">

                <img
                    src={require('../static/images/logo.png')}
                    alt="CATLab logo"
                    className="logo-img"
                />

                <h1 className='hero-section h1'>CATLab</h1>

                <p className="hero-subtitle">
                    Empowering the next generation of translators.
                </p>

                <button className="hero-button">
                    Get Started!
                </button>

            </section>

            <section className="features-section">

                <div className="feature-card">
                    <h2>Open Source & Free</h2>

                    <p>
                        No expensive licenses. No trial period.
                        Free forever for students, universities
                        and the community.
                    </p>
                </div>

                <div className="feature-card">
                    <h2>Made for Students</h2>

                    <p>
                        Skip the steep learning curve of corporate software.
                        Master the art of translation in a safe, intuitive
                        environment designed specifically for education.
                    </p>
                </div>

                <div className="feature-card">
                    <h2>Seamless Collaboration</h2>

                    <p>
                        Students can team up on shared translations and peer
                        reviews, while educators can easily monitor progress,
                        evaluate segments, and leave direct feedback.
                    </p>
                </div>

            </section>

        </div>
    );
}