import React from 'react';

import '../App.css';
import '../static/css/home/home.css';
import eye from '../static/images/eye.png';
import collab from '../static/images/collab.png';
import free from '../static/images/free.png';

export default function About() {
	return (
		<div className="home-page-container about-page">
			<section className="about-hero">
				<h1>About CATLab</h1>

                <section className="about-block">
				<h2>Democratizing Translation Technology</h2>

				<p className="about-lede">
					We believe that learning to translate shouldn't mean fighting with complex software. 
                    Our mission is to lower the technological barrier in translation classrooms, 
                    making professional tools accessible, free, and intuitive for every student and educator.
				</p>
                </section>
			
                <section className="about-block">
                    <h2>The Problem: Built for Agencies, Not Classrooms</h2>

                    <p>
                        Most CAT tools on the market share two major flaws for education: 
                        they are prohibitively expensive and designed for advanced professionals. As a result, 
                        valuable class time is wasted explaining cluttered interfaces instead of focusing on translation methodology. 
                        This causes frustration, stress, and slows down the actual learning process.
                    </p>
                </section>

                <section className="about-block">
                    <h2>Our Solution: The Perfect Stepping Stone</h2>

                    <p>
                        We created a free, open-source CAT tool specifically tailored for the
                        educational environment. It acts as the ideal bridge between early learning
                        stages and the complex industry software students will use in their future
                        careers.
                    </p>
                </section>

                <section className="about-block about-features">
                    <h2>Designed for Teaching and Learning</h2>

                    <div className="about-feature-list">
                        <article className="about-feature-item">
                            <img src={eye} alt="Progressive learning" className="about-icon-img" />

                            <div className="about-feature-text">
                                <h3>Progressive & Learn UI</h3>

                                <p>
                                    A simplified interface that avoids overwhelming beginners,
                                    letting them focus on translating.
                                </p>
                            </div>
                        </article>

                        <article className="about-feature-item">
                            <img src={collab} alt="Teacher student collaboration" className="about-icon-img" />

                            <div className="about-feature-text">
                                <h3>Teacher-Student Collaboration</h3>

                                <p>
                                    Built-in tools for educators to review work, track version
                                    control, and provide direct feedback.
                                </p>
                            </div>
                        </article>

                        <article className="about-feature-item">
                            <img src={free} alt="Zero license fees" className="about-icon-img" />

                            <div className="about-feature-text">
                                <h3>Zero License Fees</h3>

                                <p>
                                    A stress-free sandbox to practice translations, segments, and
                                    memories without expensive subscriptions.
                                </p>
                            </div>
                        </article>
                    </div>
                </section>
            </section>
		</div>
	);
}
