import React, { useEffect, useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import '../static/css/student/myProjects.css';
import tokenService from '../services/token.service';
import useFetchState from '../util/useFetchState';

const STATUS_MAP = {
    BORRADOR: { label: 'Draft', className: 'draft' },
    PENDIENTE: { label: 'Pending', className: 'pending' },
    ACEPTADO: { label: 'Accepted', className: 'accepted' },
    PUBLICADO: { label: 'Published', className: 'published' },
    CORREGIDO: { label: 'Corrected', className: 'corrected' },
};

const getActionsByStatus = (project, isCollaborative) => {
    switch (project?.estado) {
        case 'BORRADOR':
            return isCollaborative ? ['Compare'] : ['Publish'];
        case 'PUBLICADO':
            return ['View'];
        case 'CORREGIDO':
            return ['View', 'Re-edit'];
        default:
            return isCollaborative ? ['Colaborativo'] : ['Open'];
    }
};

const canEditProject = (project) => project?.estado !== 'PUBLICADO' && project?.estado !== 'CORREGIDO';

export default function MyProjects() {
    const [message, setMessage] = useState(null);
    const [visible, setVisible] = useState(false);
    const [projectToReedit, setProjectToReedit] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [studentsModalProject, setStudentsModalProject] = useState(null);
    const [openMenuProjectId, setOpenMenuProjectId] = useState(null);
    const [projectToEdit, setProjectToEdit] = useState(null);
    const [editProjectName, setEditProjectName] = useState('');
    const [editProjectSubmitting, setEditProjectSubmitting] = useState(false);
    const [projectCannotDelete, setProjectCannotDelete] = useState(null);

    const jwt = tokenService.getLocalAccessToken();
    const currentUser = tokenService.getUser();
    const currentUserId = currentUser?.id;
    const navigate = useNavigate();

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
            const collaboratorCount = collaborators.length - 1;
            const isCollaborative = collaboratorCount > 0;

            const status = STATUS_MAP[project.estado] || {
                label: project.estado || 'Draft',
                className: 'draft',
            };

            return {
                id: project.id,
                rawProject: project,
                name: project.name || 'Proyecto sin nombre',
                origin: project.idiomaOrigen?.codigo || '—',
                destination: project.idiomaDestino?.codigo || '—',
                status: status.label,
                statusClass: status.className,
                canEdit: canEditProject(project),
                collaboratorCount,
                isCollaborative,
                students,
                badge: isCollaborative ? 'pink' : 'gray',
                actions: getActionsByStatus(project, isCollaborative),
            };
        });

        setMappedProjects(nextProjects);
    }, [projects, currentUserId]);

    const showNotImplementedAlert = () => {
        setMessage('Not implemented yet');
        setVisible(true);
    };

    const openEditModal = (project) => {
        if (!project || !canEditProject(project)) {
            setMessage('This project cannot be edited while it is Published or Corrected.');
            setVisible(true);
            return;
        }

        setProjectToEdit(project);
        setEditProjectName(project?.name || '');
        setMessage(null);
        setVisible(false);
    };

    const closeEditModal = () => {
        setProjectToEdit(null);
        setEditProjectName('');
        setEditProjectSubmitting(false);
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();

        if (!projectToEdit) return;

        const nextName = editProjectName.trim();
        if (!nextName) {
            setMessage('Introduce un nombre para el proyecto.');
            setVisible(true);
            return;
        }

        try {
            setEditProjectSubmitting(true);

            const response = await fetch(`/api/proyectos/${projectToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: nextName }),
            });

            if (response.ok) {
                const updatedProject = await response.json();
                setProjects((prevProjects) =>
                    prevProjects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
                );
                closeEditModal();
            } else {
                const text = await response.text();
                setMessage(text || 'Error al guardar el nombre del proyecto.');
                setVisible(true);
            }
        } catch (error) {
            setMessage('Error al conectar con el servidor.');
            setVisible(true);
        } finally {
            setEditProjectSubmitting(false);
        }
    };

    const handleActionClick = async (action, project) => {
        // Redirigir a la pantalla de traducción
        if (action === 'Open' || action === 'View') {
            navigate(`/translate/${project.id}`);
            return;
        }

        if (action === 'Re-edit') {
            setProjectToReedit(project);
            return;
        }

        if (project.isCollaborative || action !== 'Publish') {
            showNotImplementedAlert();
            return;
        }

        if (action === 'Publish') {
            try {
                const response = await fetch(`/api/proyectos/publish/${project.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${jwt}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const updatedProject = await response.json();
                    setProjects((prevProjects) =>
                        prevProjects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
                    );
                    setMessage(null);
                    setVisible(false);
                } else {
                    const text = await response.text();
                    setMessage(text || 'Error al publicar el proyecto.');
                    setVisible(true);
                }
            } catch (error) {
                setMessage('Error al conectar con el servidor.');
                setVisible(true);
            }
        }
    };

    const confirmReedit = async () => {
        if (!projectToReedit) return;

        try {
            const response = await fetch(`/api/proyectos/re-edit/${projectToReedit.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const updatedProject = await response.json();
                setProjects((prevProjects) =>
                    prevProjects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
                );
                setMessage(null);
                setVisible(false);
            } else {
                const text = await response.text();
                setMessage(text || 'Error al poner el proyecto en borrador.');
                setVisible(true);
            }
        } catch (error) {
            setMessage('Error al conectar con el servidor.');
            setVisible(true);
        } finally {
            setProjectToReedit(null);
        }
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;

        try {
            const response = await fetch(`/api/proyectos/delete/${projectToDelete.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                },
            });

            if (response.ok) {
                setProjects((prevProjects) =>
                    prevProjects.filter((p) => p.id !== projectToDelete.id)
                );
                setMessage(null);
                setVisible(false);
            } else {
                const text = await response.text();
                setMessage(text || 'Error al eliminar el proyecto.');
                setVisible(true);
            }
        } catch (error) {
            setMessage('Error al conectar con el servidor.');
            setVisible(true);
        } finally {
            setProjectToDelete(null);
        }
    };

    return (
        <div className="my-projects-page" onClick={() => setOpenMenuProjectId(null)}>
            <div className="my-projects-shell">
                <header className="my-projects-header">
                    <h1 className="my-projects-title">My projects</h1>
                    <button
                        className="my-projects-new-btn"
                        type="button"
                        onClick={() => navigate('/my-projects/new')}
                    >
                        New project
                    </button>
                </header>

                {visible && message && (
                    <p className="my-projects-message error">{message}</p>
                )}

                <div className="my-projects-list">
                    {mappedProjects.length === 0 ? (
                        <p className="my-projects-message">No projects found for this student.</p>
                    ) : (
                        mappedProjects.map((project, index) => (
                            <div key={`${project.id ?? project.name}-${index}`} className="my-project-item">
                                <div className="project-main">
                                    {/* Al pulsar el nombre redirigimos a la pantalla de traducción sin importar si es editable o no */}
                                    <button
                                        className="project-name project-name-link"
                                        type="button"
                                        onClick={() => navigate(`/translate/${project.id}`)}
                                        style={{ textAlign: 'left' }}
                                    >
                                        {project.name}
                                    </button>
                                </div>

                                <span className={`project-status ${project.statusClass}`}>
                                    <span className="project-status-dot" aria-hidden="true" />
                                    {project.status}
                                </span>

                                <div className="project-collab-box">
                                    {!project.isCollaborative ? (
                                        <button
                                            className="project-invite-button"
                                            aria-label="Invite collaborators"
                                            type="button"
                                            onClick={showNotImplementedAlert}
                                        >
                                            <span className="project-invite-text">Invite</span>
                                            <span className="project-invite-plus" aria-hidden="true">
                                                <FiUserPlus />
                                            </span>
                                        </button>
                                    ) : (
                                        <>
                                            <span
                                                className={`project-badge ${project.badge}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setStudentsModalProject(project)}
                                            >
                                                {`+${project.collaboratorCount}`}
                                            </span>
                                            <button
                                                className="project-invite-button"
                                                aria-label="View collaborators"
                                                type="button"
                                                onClick={() => setStudentsModalProject(project)}
                                            >
                                                <span className="project-invite-plus" aria-hidden="true">
                                                    <FiUserPlus />
                                                </span>
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="project-action" style={{ gap: '8px' }}>
                                    {project.actions.map((actionName) => (
                                        <button
                                            key={actionName}
                                            className={`project-button ${
                                                actionName === 'Publish' || actionName === 'Re-edit'
                                                    ? 'project-button-primary'
                                                    : 'project-button-secondary'
                                            }`}
                                            type="button"
                                            onClick={() => handleActionClick(actionName, project)}
                                        >
                                            {actionName}
                                        </button>
                                    ))}
                                </div>

                                {/* Menú Opciones (Tres Puntos) */}
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
                                        <div style={modalStyles.dropdownMenu}>
                                            {project.canEdit && (
                                                <button
                                                    style={modalStyles.dropdownItem}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuProjectId(null);
                                                        openEditModal(project); // La edición del nombre sigue disponible en el menú de 3 puntos
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                style={{
                                                    ...modalStyles.dropdownItem,
                                                    color: '#b91c1c',
                                                    borderTop: project.canEdit ? '1px solid #f3f4f6' : 'none',
                                                }}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuProjectId(null);

                                                    if (project.rawProject?.estado === 'PUBLICADO') {
                                                        setProjectCannotDelete(project);
                                                    } else {
                                                        setProjectToDelete(project);
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Popup Confirmar Re-edit */}
            {projectToReedit && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.content}>
                        <h3 style={modalStyles.title}>Re-edit project?</h3>
                        <p style={modalStyles.text}>
                            Are you sure you want to re-edit the project <strong>"{projectToReedit.name}"</strong>? 
                            The status will change back to <strong>Draft</strong>.
                        </p>
                        <div style={modalStyles.buttonContainer}>
                            <button 
                                style={{ ...modalStyles.button, ...modalStyles.cancelBtn }}
                                onClick={() => setProjectToReedit(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                style={{ ...modalStyles.button, ...modalStyles.confirmBtn }}
                                onClick={confirmReedit}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {projectToEdit && (
                <div style={modalStyles.overlay} onClick={closeEditModal}>
                    <div style={modalStyles.editContent} onClick={(e) => e.stopPropagation()}>
                        <h3 style={modalStyles.editTitle}>Edit title</h3>

                        <form onSubmit={handleEditSubmit}>
                            <input
                                type="text"
                                value={editProjectName}
                                onChange={(e) => setEditProjectName(e.target.value)}
                                style={modalStyles.editInput}
                                placeholder="Project title"
                                autoFocus
                            />

                            <p style={modalStyles.editHint}>
                                Only the project name can be changed.
                            </p>

                            <div style={modalStyles.buttonContainer}>
                                <button
                                    style={{ ...modalStyles.button, ...modalStyles.cancelBtn }}
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={editProjectSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    style={{ ...modalStyles.button, ...modalStyles.confirmBtn }}
                                    type="submit"
                                    disabled={editProjectSubmitting}
                                >
                                    {editProjectSubmitting ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Popup Confirmar Eliminar */}
            {projectToDelete && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.content}>
                        <h3 style={modalStyles.title}>Delete project?</h3>
                        <p style={modalStyles.text}>
                            Are you sure you want to permanently delete the project <strong>"{projectToDelete.name}"</strong>? 
                            This action cannot be undone.
                        </p>
                        <div style={modalStyles.buttonContainer}>
                            <button 
                                style={{ ...modalStyles.button, ...modalStyles.cancelBtn }}
                                onClick={() => setProjectToDelete(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                style={{ ...modalStyles.button, ...modalStyles.deleteBtn }}
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup No se puede eliminar */}
            {projectCannotDelete && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.content}>
                        <div style={modalStyles.warningIcon}>!</div>

                        <h3 style={modalStyles.title}>Project cannot be deleted</h3>

                        <p style={modalStyles.text}>
                            The project <strong>"{projectCannotDelete.name}"</strong> cannot be deleted
                            because it has already been <strong>Published</strong>.
                        </p>

                        <p style={modalStyles.warningText}>
                            Published projects are protected and cannot be removed.
                        </p>

                        <div style={modalStyles.buttonContainer}>
                            <button
                                style={{ ...modalStyles.button, ...modalStyles.confirmBtn }}
                                onClick={() => setProjectCannotDelete(null)}
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Popup Lista Estudiantes */}
            {studentsModalProject && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.content}>
                        <h3 style={modalStyles.title}>Project Students</h3>
                        <p style={{ ...modalStyles.text, marginBottom: '16px' }}>
                            Project: <strong>"{studentsModalProject.name}"</strong>
                        </p>
                        
                        <ul style={modalStyles.studentList}>
                            {studentsModalProject.students.map((student, idx) => (
                                <li key={student.id || idx} style={modalStyles.studentItem}>
                                    @{student.username || student.user?.username || `usuario_${student.id}`}
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
    editContent: {
        background: '#ffffff',
        borderRadius: '18px',
        padding: '24px',
        maxWidth: '520px',
        width: '92%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        textAlign: 'center',
        fontFamily: "'Anonymous Pro', monospace",
    },
    title: {
        fontSize: '1.8rem',
        margin: '0 0 12px 0',
        color: '#1f2937',
    },
    editTitle: {
        fontSize: '1.9rem',
        margin: '0 0 18px 0',
        color: '#1f2937',
    },
    editInput: {
        width: '100%',
        borderRadius: '12px',
        border: '1px solid #d1d5db',
        padding: '12px 14px',
        fontSize: '1.3rem',
        fontFamily: "'Anonymous Pro', monospace",
        color: '#1f2937',
        boxSizing: 'border-box',
        outline: 'none',
        marginBottom: '14px',
    },
    editHint: {
        fontSize: '1.05rem',
        color: '#6b7280',
        margin: '0 0 20px 0',
        textAlign: 'left',
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
    cancelBtn: {
        background: '#ffffff',
        borderColor: '#9ca3af',
        color: '#4b5563',
    },
    confirmBtn: {
        background: '#0f766e',
        borderColor: '#0f766e',
        color: '#ffffff',
    },
    deleteBtn: {
        background: '#b91c1c',
        borderColor: '#b91c1c',
        color: '#ffffff',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        minWidth: '130px',
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: '12px 16px',
        border: 'none',
        background: 'transparent',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        fontFamily: "'Anonymous Pro', monospace",
        color: '#1f2937',
        width: '100%',
        },
        warningIcon: {
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: '#fef3c7',
        color: '#d97706',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto',
        fontSize: '1.8rem',
        fontWeight: 'bold',
        border: '2px solid #f59e0b',
    },

    warningText: {
        fontSize: '1.05rem',
        color: '#92400e',
        background: '#fffbeb',
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '24px',
        lineHeight: '1.4',
    },
};