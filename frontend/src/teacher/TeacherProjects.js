import React, { useState } from 'react';
import '../static/css/student/myProjects.css';
import '../static/css/teacher/teacherProjects.css';
import tokenService from '../services/token.service';
import useFetchState from '../util/useFetchState';

export default function TeacherProjects() {
    const [message, setMessage] = useState(null);
    const [visible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('TO_GRADE'); // 'TO_GRADE' | 'GRADED'
    const [openMenuProjectId, setOpenMenuProjectId] = useState(null);

    const jwt = tokenService.getLocalAccessToken();

    const [projects, setProjects] = useFetchState(
        [],
        '/api/proyectos/profesor',
        jwt,
        setMessage,
        setVisible
    );

    // Filtrar según el estado equivalente
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
                setMessage(text || 'Error al actualizar el estado del proyecto.');
                setVisible(true);
            }
        } catch (error) {
            setMessage('Error al conectar con el servidor.');
            setVisible(true);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '18 mar'; // Fecha por defecto si no existe en BD
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="my-projects-page" onClick={() => setOpenMenuProjectId(null)}>
            <div className="my-projects-shell">
                <header className="my-projects-header">
                    <h1 className="my-projects-title">Projects</h1>
                </header>

                {visible && message && (
                    <p className="my-projects-message error">{message}</p>
                )}

                <div className="teacher-container-card">
                    {/* Navegación por pestañas (To Grade / Graded) */}
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

                    {/* Lista de proyectos */}
                    <div className="teacher-projects-list">
                        {filteredProjects.length === 0 ? (
                            <p className="my-projects-message" style={{ padding: '24px' }}>
                                No projects in this section.
                            </p>
                        ) : (
                            filteredProjects.map((project, index) => {
                                const students = Array.isArray(project.estudiantes) ? project.estudiantes : [];
                                const isCollaborative = students.length > 1;
                                const extraCollaborators = students.length > 1 ? students.length - 1 : 0;

                                return (
                                    <div
                                        key={`${project.id ?? index}`}
                                        className="my-project-item teacher-project-item"
                                    >
                                        <div className="project-main">
                                            <h2 className="project-name">{project.name || 'Untitled Project'}</h2>
                                            <span className="project-lang">
                                                {`${project.idiomaOrigen?.codigo || 'EN'}>${project.idiomaDestino?.codigo || 'ES'}`}
                                            </span>
                                        </div>

                                        <span className="teacher-project-date">
                                            {formatDate(project.fechaCreacion || project.createdDate)}
                                        </span>

                                        <div className="teacher-collab-box">
                                            {isCollaborative ? (
                                                <div className="mockup-avatars">
                                                    <span className="avatar grey"></span>
                                                    <span className="avatar pink"></span>
                                                    <span className="avatar-count">+{extraCollaborators}</span>
                                                </div>
                                            ) : (
                                                <div className="mockup-avatars">
                                                    <span className="avatar pink"></span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="project-action">
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

                                        <div style={{ position: 'relative' }}>
                                            <button
                                                className="project-menu"
                                                aria-label="Project menu"
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuProjectId(
                                                        openMenuProjectId === project.id ? null : project.id
                                                    );
                                                }}
                                            >
                                                ⋮
                                            </button>

                                            {openMenuProjectId === project.id && (
                                                <div className="teacher-dropdown-menu">
                                                    <button
                                                        className="teacher-dropdown-item"
                                                        type="button"
                                                        onClick={() => {
                                                            setMessage('Aún no está implementado');
                                                            setVisible(true);
                                                        }}
                                                    >
                                                        Ver entregable
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}