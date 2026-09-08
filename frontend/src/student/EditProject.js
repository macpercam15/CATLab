import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import tokenService from '../services/token.service';
import '../static/css/student/newProject.css';

export default function EditProject() {
    const navigate = useNavigate();
    const { id } = useParams();
    const jwt = tokenService.getLocalAccessToken();

    const [project, setProject] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        let active = true;

        const loadProject = async () => {
            try {
                const response = await fetch(`/api/proyectos/${id}`, {
                    headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text || 'No se ha podido cargar el proyecto.');
                }

                const data = await response.json();
                if (active) {
                    setProject(data);
                    setProjectName(data?.name || '');
                }
            } catch (error) {
                if (active) {
                    setMessage(error.message || 'No se ha podido cargar el proyecto.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadProject();

        return () => {
            active = false;
        };
    }, [id, jwt]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');

        if (!projectName.trim()) {
            setMessage('Introduce un nombre para el proyecto.');
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch(`/api/proyectos/${id}`, {
                method: 'PUT',
                headers: {
                    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: projectName.trim() }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'No se ha podido guardar el proyecto.');
            }

            navigate('/my-projects');
        } catch (error) {
            setMessage(error.message || 'No se ha podido guardar el proyecto.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="new-project-page">
            <div className="new-project-shell">
                <div className="new-project-edit-header">
                    <p className="new-project-edit-kicker">Edit project title</p>
                    <input
                        className="new-project-title new-project-title-input"
                        type="text"
                        value={projectName}
                        onChange={(event) => setProjectName(event.target.value)}
                        placeholder="Project name"
                        disabled={loading}
                    />
                </div>

                <form className="new-project-card new-project-edit-card" onSubmit={handleSubmit}>
                    <p className="new-project-edit-note">
                        {project?.idiomaOrigen?.codigo || '—'} &gt; {project?.idiomaDestino?.codigo || '—'} · only the title is editable.
                    </p>

                    {message && <p className="new-project-message">{message}</p>}

                    <div className="new-project-actions">
                        <button
                            className="new-project-button secondary"
                            type="button"
                            onClick={() => navigate('/my-projects')}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button className="new-project-button primary" type="submit" disabled={submitting || loading}>
                            {submitting ? 'Saving...' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}