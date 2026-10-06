import React, { useEffect, useMemo, useState } from 'react';
import { FiArrowRight, FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import tokenService from '../services/token.service';
import '../static/css/student/newProject.css';

export default function NewProject() {
    const navigate = useNavigate();
    const jwt = tokenService.getLocalAccessToken();

    const [projectName, setProjectName] = useState('');
    const [originId, setOriginId] = useState('');
    const [destinationId, setDestinationId] = useState('');
    const [tmId, setTmId] = useState('');
    const [file, setFile] = useState(null);
    const [languages, setLanguages] = useState([]);
    const [tms, setTms] = useState([]);
    const [loadingLanguages, setLoadingLanguages] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        let active = true;

        const loadLanguages = async () => {
            try {
                const response = await fetch('/api/proyectos/idiomas', {
                    headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
                });

                if (!response.ok) {
                    throw new Error('No se pudieron cargar los idiomas.');
                }

                const data = await response.json();
                if (active) {
                    setLanguages(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (active) {
                    setMessage(error.message || 'No se pudieron cargar los idiomas.');
                }
            } finally {
                if (active) {
                    setLoadingLanguages(false);
                }
            }
        };

        const loadTms = async () => {
            try {
                const response = await fetch('/api/tm/all', { // Ajusta la ruta si tu controlador de TM es diferente
                    headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
                });
                if (response.ok) {
                    const data = await response.json();
                    if (active) setTms(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Error al cargar las memorias de traducción", error);
            }
        };

        loadLanguages();
        loadTms();

        return () => {
            active = false;
        };
    }, [jwt]);

    const compatibleTms = useMemo(() => {
        if (!originId || !destinationId) return [];
        return tms.filter(tm => {
            const idA = tm.idiomaA?.id;
            const idB = tm.idiomaB?.id;
            const oId = Number(originId);
            const dId = Number(destinationId);
            return (idA === oId && idB === dId) || (idA === dId && idB === oId);
        });
    }, [tms, originId, destinationId]);

    useEffect(() => {
        if (tmId && !compatibleTms.find(tm => tm.id === Number(tmId))) {
            setTmId('');
        }
    }, [compatibleTms, tmId]);

    const languageOptions = useMemo(() => languages.map((language) => ({
        id: language.id,
        label: language.codigo ? `${language.codigo}${language.name ? ` - ${language.name}` : ''}` : language.name || `Idioma ${language.id}`,
    })), [languages]);

    const handleFileChange = (event) => {
        const nextFile = event.target.files?.[0] || null;
        setFile(nextFile);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');

        if (!projectName.trim()) {
            setMessage('Introduce un nombre para el proyecto.');
            return;
        }

        if (!originId || !destinationId) {
            setMessage('Selecciona los idiomas de origen y destino.');
            return;
        }

        if (originId === destinationId) {
            setMessage('El idioma de origen y destino no puede ser el mismo.');
            return;
        }

        if (!file) {
            setMessage('Adjunta un archivo PDF para crear el proyecto.');
            return;
        }

        const payload = {
            name: projectName.trim(),
            idiomaOrigen_id: Number(originId),
            idiomaDestino_id: Number(destinationId),
            tm_id: Number(tmId),
        };

        const formData = new FormData();
        formData.append('proyecto', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        formData.append('file', file);

        try {
            setSubmitting(true);

            const response = await fetch('/api/proyectos/new', {
                method: 'POST',
                headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'No se ha podido crear el proyecto.');
            }

            navigate('/my-projects');
        } catch (error) {
            setMessage(error.message || 'No se ha podido crear el proyecto.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="new-project-page">
            <div className="new-project-shell">
                <h1 className="new-project-title">New project</h1>

                <form className="new-project-card" onSubmit={handleSubmit}>
                    <div className="new-project-fields-row">
                        <label className="new-project-field new-project-name-field">
                            <span>Project name</span>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(event) => setProjectName(event.target.value)}
                                placeholder="Project name"
                            />
                        </label>

                        <label className="new-project-field">
                            <span>From</span>
                            <select
                                value={originId}
                                onChange={(event) => setOriginId(event.target.value)}
                                disabled={loadingLanguages}
                            >
                                <option value="">{loadingLanguages ? 'Loading...' : 'Select'}</option>
                                {languageOptions.map((language) => (
                                    <option key={language.id} value={language.id}>
                                        {language.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="new-project-direction" aria-hidden="true">
                            <FiArrowRight />
                        </div>

                        <label className="new-project-field">
                            <span>To</span>
                            <select
                                value={destinationId}
                                onChange={(event) => setDestinationId(event.target.value)}
                                disabled={loadingLanguages}
                            >
                                <option value="">{loadingLanguages ? 'Loading...' : 'Select'}</option>
                                {languageOptions.map((language) => (
                                    <option key={language.id} value={language.id}>
                                        {language.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="new-project-field">
                            <span>TM</span>
                            <select 
                                value={tmId} 
                                onChange={(event) => setTmId(event.target.value)}
                                disabled={!originId || !destinationId || compatibleTms.length === 0}
                            >
                                <option value="">
                                    {!originId || !destinationId 
                                        ? 'Select languages first' 
                                        : compatibleTms.length === 0 
                                            ? 'No compatible TM' 
                                            : 'Select TM'}
                                </option>
                                {compatibleTms.map((tm) => (
                                    <option key={tm.id} value={tm.id}>
                                        {tm.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="new-project-upload-zone">
                        <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handleFileChange}
                        />
                        <span className="new-project-upload-icon" aria-hidden="true">
                            <FiUpload />
                        </span>
                        <span className="new-project-upload-title">Upload your files</span>
                        <span className="new-project-upload-hint">
                            PDF only. You can add the TM later.
                        </span>
                        {file && (
                            <span className="new-project-upload-file">
                                Selected file: {file.name}
                            </span>
                        )}
                    </label>

                    {message && <p className="new-project-message">{message}</p>}

                    <div className="new-project-actions">
                        <button
                            className="new-project-button secondary"
                            type="button"
                            onClick={() => navigate('/my-projects')}
                        >
                            Cancel
                        </button>
                        <button className="new-project-button primary" type="submit" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}