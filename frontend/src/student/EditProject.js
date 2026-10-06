import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import tokenService from '../services/token.service';
import '../static/css/student/newProject.css';
import '../static/css/student/editProject.css';

export default function EditProject() {
    const navigate = useNavigate();
    const { id } = useParams();
    const jwt = tokenService.getLocalAccessToken();

    const [project, setProject] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [tmId, setTmId] = useState('');
    const [tms, setTms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTms, setLoadingTms] = useState(true);
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
                    setTmId(data?.tm?.id ? String(data.tm.id) : '');
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

    useEffect(() => {
        let active = true;

        const loadTms = async () => {
            try {
                const response = await fetch('/api/tm/all', {
                    headers: jwt ? { Authorization: `****** } : undefined,
                });

                if (!response.ok) {
                    throw new Error('No se pudieron cargar las memorias de traducción.');
                }

                const data = await response.json();
                if (active) {
                    setTms(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (active) {
                    setMessage(error.message || 'No se pudieron cargar las memorias de traducción.');
                }
            } finally {
                if (active) {
                    setLoadingTms(false);
                }
            }
        };

        loadTms();

        return () => {
            active = false;
        };
    }, [jwt]);

    const compatibleTms = tms.filter((tm) => {
        const idiomaAId = tm.idiomaA?.id;
        const idiomaBId = tm.idiomaB?.id;
        const originId = project?.idiomaOrigen?.id;
        const destinationId = project?.idiomaDestino?.id;
        return (
            (idiomaAId === originId && idiomaBId === destinationId)
            || (idiomaAId === destinationId && idiomaBId === originId)
        );
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');

        if (!projectName.trim()) {
            setMessage('Introduce un nombre para el proyecto.');
            return;
        }

        if (!tmId) {
            setMessage('Selecciona una memoria de traducción.');
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
                body: JSON.stringify({ name: projectName.trim(), tm_id: Number(tmId) }),
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
                        {project?.idiomaOrigen?.codigo || '—'} &gt; {project?.idiomaDestino?.codigo || '—'}
                    </p>

                    <label className="new-project-field new-project-edit-tm-field">
                        <span>TM</span>
                        <select
                            value={tmId}
                            onChange={(event) => setTmId(event.target.value)}
                            disabled={loading || loadingTms}
                        >
                            <option value="">
                                {loadingTms ? 'Loading...' : 'Select'}
                            </option>
                            {compatibleTms.map((tm) => (
                                <option key={tm.id} value={tm.id}>
                                    {tm.name || `TM ${tm.id}`}
                                </option>
                            ))}
                        </select>
                    </label>

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