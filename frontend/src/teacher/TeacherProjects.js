import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../static/css/student/myProjects.css';
import '../static/css/teacher/teacherProjects.css';
import tokenService from '../services/token.service';
import useFetchState from '../util/useFetchState';

export default function TeacherProjects() {
    const [message, setMessage] = useState(null);
    const [visible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('TO_GRADE'); // 'TO_GRADE' | 'GRADED'
    const [studentsModalProject, setStudentsModalProject] = useState(null);

    const navigate = useNavigate();
    const jwt = tokenService.getLocalAccessToken();

    const [projects, setProjects] = useFetchState(
        [],
        '/api/proyectos/profesor',
        jwt,
        setMessage,
        setVisible
    );

    // Filter according to equivalent status
    const filteredProjects = (projects || []).filter((p) =>
        activeTab === 'TO_GRADE' ? p.estado === 'PUBLICADO' : p.estado === 'CORREGIDO'
    );

    const handleGradeStatus = async (projectId, action) => {
        const targetStatus = action === 'SEND' ? 'CORREGIDO' : 'PUBLICADO';
        const endpoint =
            action === 'SEND'
                ? `/api/proyectos/profesor/grade/${projectId}`
                : `/api/proyectos/profesor/cancel-grade/${projectId}`;

        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setProjects((prev) =>
                    prev.map((p) =>
                        Number(p.id) === Number(projectId)
                            ? { ...p, estado: targetStatus }
                            : p
                    )
                );
            } else {
                const text = await response.text();
                setMessage(text || 'Error updating project status.');
                setVisible(true);
            }
        } catch (error) {
            setMessage('Error connecting to the server.');
            setVisible(true);
        }
    };

    return (
        <div className="my-projects-page">
            <div className="my-projects-shell">
                <header className="my-projects-header">
                    <h1 className="my-projects-title">Projects</h1>
                </header>

                {visible && message && (
                    <p className="my-projects-message error">{message}</p>
                )}

                <div className="teacher-container-card">
                    {/* Navigation Tabs (To Grade / Graded) */}
                    <div className="teacher-tabs-bar">
                        <button
                            className={`teacher-tab ${activeTab === 'TO_GRADE' ? 'active' : ''}`}
                            onClick={() => setActiveTab('TO_GRADE')}
                        >
                            To Grade
                        </button>
                        <button
                            className={`teacher-tab ${activeTab === 'GRADED' ? 'active' : ''}`}
                            onClick={() => setActiveTab('GRADED')}
                        >
                            Graded
                        </button>
                    </div>

                    {/* Projects List */}
                    <div className="teacher-projects-list">
                        {filteredProjects.length === 0 ? (
                            <p className="my-projects-message" style={{ padding: '24px' }}>
                                No projects in this section.
                            </p>
                        ) : (
                            filteredProjects.map((project, index) => {
                                const students = Array.isArray(project.estudiantes) ? project.estudiantes : [];
                                const extraCollaborators = students.length > 1 ? students.length - 1 : 0;
                                const collaboratorLabel = students.length > 1 ? `+${extraCollaborators}` : '1';

                                return (
                                    <div
                                        key={`${project.id ?? index}`}
                                        className="my-project-item teacher-project-item"
                                    >
                                        <div 
                                            className="project-main" 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/teacher/projects/${project.id}/feedback`)}
                                        >
                                            <h2 className="project-name">{project.name || 'Untitled Project'}</h2>
                                            <span className="project-lang">
                                                {`${project.idiomaOrigen?.codigo || 'EN'}>${project.idiomaDestino?.codigo || 'ES'}`}
                                            </span>
                                        </div>

                                        <div className="project-collab-box teacher-collab-box">
                                            <span
                                                className="project-badge pink teacher-collab-badge"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setStudentsModalProject(project)}
                                            >
                                                {collaboratorLabel}
                                            </span>
                                        </div>

                                        <div className="project-action" style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="teacher-btn-cancel"
                                                type="button"
                                                onClick={() => navigate(`/teacher/projects/${project.id}/feedback`)}
                                            >
                                                Review
                                            </button>

                                            {activeTab === 'TO_GRADE' ? (
                                                <button
                                                    className="teacher-btn-send"
                                                    type="button"
                                                    onClick={() => handleGradeStatus(project.id, 'SEND')}
                                                >
                                                    Send
                                                </button>
                                            ) : (
                                                <button
                                                    className="teacher-btn-cancel"
                                                    type="button"
                                                    onClick={() => handleGradeStatus(project.id, 'CANCEL')}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {studentsModalProject && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.content}>
                        <h3 style={modalStyles.title}>Project Students</h3>
                        <p style={{ ...modalStyles.text, marginBottom: '16px' }}>
                            Project: <strong>"{studentsModalProject.name}"</strong>
                        </p>

                        <ul style={modalStyles.studentList}>
                            {(studentsModalProject.estudiantes || []).map((student, idx) => (
                                <li key={student.id || idx} style={modalStyles.studentItem}>
                                    @{student.username || student.user?.username || `user_${student.id}`}
                                </li>
                            ))}
                        </ul>

                        <div style={modalStyles.buttonContainer}>
                            <button
                                style={{ ...modalStyles.button, ...modalStyles.confirmBtn }}
                                onClick={() => setStudentsModalProject(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    content: {
        background: '#ffffff',
        borderRadius: '16px',
        padding: '28px',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        textAlign: 'center',
        fontFamily: "'Anonymous Pro', monospace",
    },
    title: {
        fontSize: '1.8rem',
        margin: '0 0 12px 0',
        color: '#1f2937',
    },
    text: {
        fontSize: '1.2rem',
        color: '#4b5563',
        marginBottom: '24px',
        lineHeight: '1.4',
    },
    studentList: {
        listStyle: 'none',
        padding: 0,
        margin: '0 0 20px 0',
        maxHeight: '200px',
        overflowY: 'auto',
    },
    studentItem: {
        padding: '10px 14px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        marginBottom: '8px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'left',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
    },
    button: {
        padding: '10px 20px',
        borderRadius: '999px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: '2px solid transparent',
        transition: 'all 0.2s ease',
    },
    confirmBtn: {
        background: '#0f766e',
        borderColor: '#0f766e',
        color: '#ffffff',
    },
};