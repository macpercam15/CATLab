import React, { useEffect, useState } from 'react';

import '../App.css';
import '../static/css/home/home.css';

function detectUserRole() {
    try {
            const raw = localStorage.getItem('user') || localStorage.getItem('currentUser');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (!parsed) return null;

                // common shapes: parsed.role, parsed.roles, parsed.authority, parsed.authorities
                if (parsed.role) return String(parsed.role).toUpperCase();

                if (parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0) {
                    const r = parsed.roles[0];
                    if (typeof r === 'string') return String(r).toUpperCase();
                    if (r.name) return String(r.name).toUpperCase();
                }

                if (parsed.authority) {
                    if (typeof parsed.authority === 'string') return String(parsed.authority).toUpperCase();
                    if (parsed.authority.authority) return String(parsed.authority.authority).toUpperCase();
                }

                if (parsed.authorities && Array.isArray(parsed.authorities) && parsed.authorities.length > 0) {
                    const a = parsed.authorities[0];
                    if (typeof a === 'string') return String(a).toUpperCase();
                    if (a.authority) return String(a.authority).toUpperCase();
                    if (a.name) return String(a.name).toUpperCase();
                }

                // fallback: check some other common keys
                if (parsed.type) return String(parsed.type).toUpperCase();
                if (parsed.userType) return String(parsed.userType).toUpperCase();
                if (parsed.authorisation) return String(parsed.authorisation).toUpperCase();
        }
    } catch (e) {
        // ignore parse errors
    }
    const direct = localStorage.getItem('role') || localStorage.getItem('userRole');
    if (direct) return String(direct).toUpperCase();
    return null;
}

export default function Home() {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const r = detectUserRole();
        setRole(r);
    }, []);

    const isStudent = role === 'ESTUDIANTE' || role === 'STUDENT' || role === 'STUDENT_ROLE';
    const isTeacher = role === 'PROFESOR' || role === 'TEACHER' || role === 'TEACHER_ROLE';
    const isAdmin = role === 'ADMIN' || role === 'ADMINISTRADOR' || role === 'ADMIN_ROLE';
    const isStaff = isTeacher || isAdmin;

    const primaryLabel = isAdmin ? 'New user' : 'Projects';
    const secondaryLabel = isAdmin ? 'Users' : 'My students';
    const primaryAlert = isAdmin
        ? 'Funcionalidad "Nuevo usuario" no implementada aun'
        : 'Funcionalidad "Proyectos" no implementada aun';
    const secondaryAlert = isAdmin
        ? 'Funcionalidad "Usuarios" no implementada aun'
        : 'Funcionalidad "Mis estudiantes" no implementada aun';

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

                {isStudent ? (
                    <div className="student-hero-buttons">
                        <button
                            className="student-primary"
                            onClick={() => alert('Funcionalidad "Nuevo proyecto" no implementada aún')}
                        >
                            New project
                        </button>

                        <div className="student-secondary-row">
                            <button
                                className="student-outline"
                                onClick={() => alert('Funcionalidad "Mis proyectos" no implementada aún')}
                            >
                                My projects
                            </button>

                            <span className="student-spacer" aria-hidden="true"></span>

                            <button
                                className="student-outline"
                                onClick={() => alert('Funcionalidad "Unirme a proyecto" no implementada aún')}
                            >
                                Join project
                            </button>
                        </div>
                    </div>
                ) : isStaff ? (
                    <div className="role-hero-buttons">
                        <button
                            className="role-primary"
                            onClick={() => alert(primaryAlert)}
                        >
                            {primaryLabel}
                        </button>

                        <button
                            className="role-outline"
                            onClick={() => alert(secondaryAlert)}
                        >
                            {secondaryLabel}
                        </button>
                    </div>
                ) : (
                    <button
                        className="hero-button"
                        onClick={() => {
                            window.location.href = '/login';
                        }}
                    >
                        Get Started!
                    </button>
                )}

            </section>

            {!isStudent && !isTeacher && !isAdmin && (
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
            )}
        </div>
    );
}