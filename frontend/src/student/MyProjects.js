import React, { useEffect, useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import '../static/student/myProjects.css';
import tokenService from '../services/token.service';
import useFetchState from '../util/useFetchState';

const STATUS_MAP = {
    BORRADOR: { label: 'Draft', className: 'draft' },
    PENDIENTE: { label: 'Pending', className: 'pending' },
    ACEPTADO: { label: 'Accepted', className: 'accepted' },
    PUBLICADO: { label: 'Published', className: 'published' },
    CORREGIDO: { label: 'Corrected', className: 'corrected' },
};

const getActionByStatus = (project, collaboratorCount, currentUserId) => {
    const reviewedSegments = Number(project?.segmentosRevisados ?? project?.reviewedSegments ?? 0);
    const totalSegments = Number(project?.totalSegmentos ?? project?.totalSegments ?? 0);
    const compareInitiatedByCurrentUser =
        project?.compareInitiadoPor === currentUserId ||
        project?.compareInitiatedBy === currentUserId ||
        project?.pendientePorUsuario === true;

    switch (project?.estado) {
        case 'BORRADOR':
            return collaboratorCount === 0 ? 'Publish' : 'Compare';
        case 'PENDIENTE':
            if (compareInitiatedByCurrentUser) {
                return 'Cancel';
            }
            if (totalSegments > 0) {
                return reviewedSegments >= totalSegments ? 'Enviar' : `${reviewedSegments}/${totalSegments}`;
            }
            return 'Review';
        case 'ACEPTADO':
            return 'Publish';
        case 'PUBLICADO':
            return 'Review';
        case 'CORREGIDO':
            return 'Review';
        default:
            return 'Open';
    }
};

export default function MyProjects() {
    const [message, setMessage] = useState(null);
    const [visible, setVisible] = useState(false);
    const jwt = tokenService.getLocalAccessToken();
    const currentUser = tokenService.getUser();
    const currentUserId = currentUser?.id;

    const [projects, setProjects] = useFetchState(
        [],
        currentUserId ? `/api/proyectos/user/${currentUserId}` : null,
        jwt,
        setMessage,
        setVisible
    );

    const [mappedProjects, setMappedProjects] = useState([]);

    useEffect(() => {
        const nextProjects = (projects || []).map((project) => {
            const students = Array.isArray(project.estudiantes) ? project.estudiantes : [];
            const collaborators = students.filter(
                (student) => Number(student.id) !== Number(currentUserId)
            );
            const collaboratorCount = collaborators.length -1;
            const status = STATUS_MAP[project.estado] || {
                label: project.estado || 'Draft',
                className: 'draft',
            };

            return {
                id: project.id,
                name: project.name || 'Proyecto sin nombre',
                origin: project.idiomaOrigen?.codigo || '—',
                destination: project.idiomaDestino?.codigo || '—',
                status: status.label,
                statusClass: status.className,
                collaboratorCount,
                badge: collaboratorCount > 0 ? 'pink' : 'gray',
                action: getActionByStatus(project, collaboratorCount, currentUserId),
            };
        });

        setMappedProjects(nextProjects);
    }, [projects, currentUserId]);

    return (
        <div className="my-projects-page">
            <div className="my-projects-shell">
                <header className="my-projects-header">
                    <h1 className="my-projects-title">My projects</h1>
                    <button className="my-projects-new-btn" type="button">New project</button>
                </header>

                {visible && message ? (
                    <p className="my-projects-message error">{message}</p>
                ) : (
                    <div className="my-projects-list">
                        {mappedProjects.length === 0 ? (
                            <p className="my-projects-message">No projects found for this student.</p>
                        ) : (
                            mappedProjects.map((project, index) => (
                                <div key={`${project.id ?? project.name}-${index}`} className="my-project-item">
                                    <div className="project-main">
                                        <h2 className="project-name">{project.name}</h2>
                                        <span className="project-lang">{`${project.origin}>${project.destination}`}</span>
                                    </div>

                                    <span className={`project-status ${project.statusClass}`}>
                                        <span className="project-status-dot" aria-hidden="true" />
                                        {project.status}
                                    </span>

                                    <div className="project-collab-box">
                                        {project.collaboratorCount === 0 ? (
                                            <button className="project-invite-button" aria-label="Invite collaborators" type="button">
                                                <span className="project-invite-text">Invite</span>
                                                <span className="project-invite-plus" aria-hidden="true"><FiUserPlus /></span>
                                            </button>
                                        ) : (
                                            <>
                                                <span className={`project-badge ${project.badge}`}>
                                                    {`+${project.collaboratorCount}`}
                                                </span>
                                                <button className="project-invite-button" aria-label="Invite collaborators" type="button">
                                                    <span className="project-invite-plus" aria-hidden="true"><FiUserPlus /></span>
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="project-action">
                                        <button
                                            className={`project-button ${['Publish', 'Compare'].includes(project.action) ? 'project-button-primary' : 'project-button-secondary'}`}
                                            type="button"
                                        >
                                            {project.action}
                                        </button>
                                    </div>

                                    <button className="project-menu" aria-label="Project menu" type="button">
                                        ⋮
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
