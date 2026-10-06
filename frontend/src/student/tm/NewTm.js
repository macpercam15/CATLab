import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tokenService from '../../services/token.service';
import '../../static/css/tm/tm.css';

export default function NewTM() {
    const navigate = useNavigate();

    // Solo necesitamos el JWT para los headers, como en NewProject
    const jwt = tokenService.getLocalAccessToken();

    const [name, setName] = useState('');
    const [languages, setLanguages] = useState([]);
    const [idiomaA, setIdiomaA] = useState('');
    const [idiomaB, setIdiomaB] = useState('');
    const [loadingLanguages, setLoadingLanguages] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

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
            } catch (err) {
                if (active) {
                    setError(err.message || 'Error al cargar los idiomas.');
                }
            } finally {
                if (active) {
                    setLoadingLanguages(false);
                }
            }
        };

        loadLanguages();

        return () => {
            active = false;
        };
    }, [jwt]);

    const languageOptions = useMemo(() => {
        return languages.map((lang) => ({
            id: lang.id,
            label: lang.codigo ? `${lang.codigo}${lang.name ? ` - ${lang.name}` : ''}` : lang.name || `Idioma ${lang.id}`,
        }));
    }, [languages]);

    const swapLanguages = () => {
        setIdiomaA(idiomaB);
        setIdiomaB(idiomaA);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('The TM needs a name.');
            return;
        }
        if (!idiomaA || !idiomaB) {
            setError('Select both languages.');
            return;
        }
        if (idiomaA === idiomaB) {
            setError('The two languages must be different.');
            return;
        }

        // El payload coincide exactamente con CreateTmDTO.java
        // El usuario será interceptado en el backend mediante el token JWT
        const payload = {
            name: name.trim(),
            idiomaA_id: Number(idiomaA),
            idiomaB_id: Number(idiomaB),
        };

        try {
            setSaving(true);

            const response = await fetch('/api/tm/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Error creating translation memory.');
            }

            navigate('/student/tms');
        } catch (err) {
            setError(err.message || 'Error connecting to the server.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="tm-page">
            <div className="tm-shell tm-shell-narrow">
                <h1 className="tm-title">New TM</h1>

                <form className="tm-card" onSubmit={handleSubmit}>
                    <label className="tm-field">
                        <span>Name</span>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>

                    <div className="tm-field">
                        <span>Languages</span>
                        <div className="tm-lang-row">
                            <select
                                value={idiomaA}
                                onChange={(e) => setIdiomaA(e.target.value)}
                                aria-label="Language A"
                                disabled={loadingLanguages}
                            >
                                <option value="">
                                    {loadingLanguages ? 'Loading...' : 'Select language'}
                                </option>
                                {languageOptions.map((i) => (
                                    <option key={i.id} value={i.id}>
                                        {i.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                className="tm-swap"
                                onClick={swapLanguages}
                                title="Swap languages"
                                aria-label="Swap languages"
                            >
                                ⇄
                            </button>

                            <select
                                value={idiomaB}
                                onChange={(e) => setIdiomaB(e.target.value)}
                                aria-label="Language B"
                                disabled={loadingLanguages}
                            >
                                <option value="">
                                    {loadingLanguages ? 'Loading...' : 'Select language'}
                                </option>
                                {languageOptions.map((i) => (
                                    <option key={i.id} value={i.id}>
                                        {i.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <small className="tm-hint">
                            A TM works in both directions, so the order of the languages doesn't matter.
                        </small>
                    </div>

                    {error && <p className="tm-message error">{error}</p>}

                    <div className="tm-form-actions">
                        <button className="tm-button primary" type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Submit'}
                        </button>
                        <button
                            type="button"
                            className="tm-button danger"
                            onClick={() => navigate('/student/tms')}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}