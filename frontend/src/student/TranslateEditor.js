import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tokenService from '../services/token.service';
import '../static/css/student/TranslateEditor.css';

const STATUS_CONFIG = {
    BORRADOR: {
        colorClass: 'status-draft',
        label: 'Draft'
    },
    TRADUCIDO: {
        colorClass: 'status-traduced',
        label: 'Traduced'
    },
    REVISADO: {
        colorClass: 'status-revised',
        label: 'Revised'
    },
    PUBLICADO: {
        colorClass: 'status-published',
        label: 'Published'
    },
    CORREGIDO: {
        colorClass: 'status-corrected',
        label: 'Corrected'
    }
};

export default function TranslateEditor() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const jwt = tokenService.getLocalAccessToken();

    const [project, setProject] = useState(null);
    const [segments, setSegments] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [feedbackPopupId, setFeedbackPopupId] = useState(null);
    const [currentTranslation, setCurrentTranslation] = useState('');
    const [activeTab, setActiveTab] = useState('TM');
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // --- Glosario ---
    const [glossaryMatches, setGlossaryMatches] = useState([]);
    const [glossaryLoading, setGlossaryLoading] = useState(false);
    const [selectionBtn, setSelectionBtn] = useState(null); // { text, x, y }
    const [isSavingEntry, setIsSavingEntry] = useState(false);
    const [glossaryMenuOpenId, setGlossaryMenuOpenId] = useState(null);
    const [glossaryModal, setGlossaryModal] = useState({
        open: false,
        id: null,
        origen: '',
        destino: '',
        lockOrigen: false
    });
    const glossaryRequestRef = useRef(0);

    const [toast, setToast] = useState({
        visible: false,
        message: '',
        type: ''
    });

    const isProjectPublished =
        project?.estado === 'PUBLICADO';

    const isProjectCorrected =
        project?.estado === 'CORREGIDO';

    const canShowPublishBtn =
        project?.estado !== 'PUBLICADO' &&
        project?.estado !== 'CORREGIDO';

    useEffect(() => {
        fetchProjectData();
        fetchSegments();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setExpandedId(null);
                setFeedbackPopupId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, []);

    useEffect(() => {
        if (!glossaryMenuOpenId) return;

        const handleClickOutside = (e) => {
            if (!e.target.closest('.glossary-menu-container')) {
                setGlossaryMenuOpenId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [glossaryMenuOpenId]);

    const showToast = (message, type = 'error') => {
        setToast({
            visible: true,
            message,
            type
        });

        setTimeout(() => {
            setToast({
                visible: false,
                message: '',
                type: ''
            });
        }, 4000);
    };

    const parseErrorMessage = (
        rawText,
        fallbackMsg
    ) => {
        if (!rawText) {
            return fallbackMsg;
        }

        try {
            const parsed = JSON.parse(rawText);

            if (parsed.message) {
                return parsed.message;
            }
        } catch (e) {
            if (
                rawText.includes('<html') ||
                rawText.includes('<!DOCTYPE')
            ) {
                return fallbackMsg;
            }
        }

        const cleaned = rawText
            .replace(/<[^>]*>?/gm, '')
            .trim();

        return (
            cleaned.length > 80 ||
            cleaned.includes('{')
        )
            ? fallbackMsg
            : cleaned;
    };

    const fetchProjectData = async () => {
        try {
            const res = await fetch(
                `/api/proyectos/${projectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                }
            );

            if (res.ok) {
                const data = await res.json();
                setProject(data);
            }
        } catch (error) {
            console.error(
                'Error fetching project:',
                error
            );
        }
    };

    const fetchSegments = async () => {
        try {
            const res = await fetch(
                `/api/segmentos/proyecto/${projectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                }
            );

            if (res.ok) {
                const data = await res.json();
                setSegments(data);
            }
        } catch (error) {
            console.error(
                'Error fetching segments:',
                error
            );
        }
    };

    const handleExpand = (segment) => {
        if (
            isProjectPublished ||
            expandedId === segment.id
        ) {
            return;
        }

        setExpandedId(segment.id);

        setCurrentTranslation(
            segment.textoTraducido || ''
        );
    };

    const handleSaveTranslation = async (
        segmentId,
        text
    ) => {
        if (!text.trim()) {
            return;
        }

        setIsSaving(true);

        try {
            const res = await fetch(
                `/api/segmentos/traducir/${segmentId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                        'Content-Type': 'text/plain'
                    },
                    body: text
                }
            );

            if (res.ok) {
                await fetchSegments();

                setExpandedId(null);

                showToast(
                    'Traducción guardada correctamente',
                    'success'
                );
            } else {
                const errorText =
                    await res.text();

                const friendlyMsg =
                    parseErrorMessage(
                        errorText,
                        'No se pudo guardar la traducción.'
                    );

                showToast(
                    friendlyMsg,
                    'error'
                );
            }
        } catch (error) {
            showToast(
                'Error de conexión con el servidor',
                'error'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusAction = async (
        e,
        segment
    ) => {
        e.stopPropagation();

        if (isProjectCorrected) {
            return;
        }

        if (
            segment.estado !== 'REVISADO' &&
            currentTranslation !==
                segment.textoTraducido &&
            expandedId === segment.id
        ) {
            await handleSaveTranslation(
                segment.id,
                currentTranslation
            );
        }

        let endpoint = '';

        if (segment.estado === 'BORRADOR') {
            endpoint =
                `/api/segmentos/marcarTraducido/${segment.id}`;
        } else if (
            segment.estado === 'TRADUCIDO'
        ) {
            endpoint =
                `/api/segmentos/marcarRevisado/${segment.id}`;
        } else if (
            segment.estado === 'REVISADO'
        ) {
            endpoint =
                `/api/segmentos/marcarBorrador/${segment.id}`;
        }

        if (endpoint) {
            try {
                const res = await fetch(
                    endpoint,
                    {
                        method: 'PUT',
                        headers: {
                            Authorization: `Bearer ${jwt}`
                        }
                    }
                );

                if (res.ok) {
                    await fetchSegments();
                } else {
                    const errorText =
                        await res.text();

                    const friendlyMsg =
                        parseErrorMessage(
                            errorText,
                            'Debes introducir una traducción antes de marcar el segmento como traducido.'
                        );

                    showToast(
                        friendlyMsg,
                        'error'
                    );
                }
            } catch (error) {
                showToast(
                    'Error de conexión con el servidor',
                    'error'
                );
            }
        }
    };

    const handlePublishProject = async () => {
        if (isProjectCorrected) {
            return;
        }

        setIsPublishing(true);

        try {
            const res = await fetch(
                `/api/proyectos/publish/${projectId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                }
            );

            if (res.ok) {
                showToast(
                    'Proyecto publicado correctamente',
                    'success'
                );

                await fetchProjectData();
                await fetchSegments();
            } else {
                const errorText =
                    await res.text();

                const friendlyMsg =
                    parseErrorMessage(
                        errorText,
                        'No se pudo publicar el proyecto. Verifica que todos los segmentos estén listos.'
                    );

                showToast(
                    friendlyMsg,
                    'error'
                );
            }
        } catch (error) {
            showToast(
                'Error de conexión con el servidor',
                'error'
            );
        } finally {
            setIsPublishing(false);
        }
    };

    // #region GLOSARIO
    const normalizeTerm = (s) =>
        (s || '').trim().replace(/\s+/g, ' ').toLowerCase();

    const fetchGlossaryMatches = async (segmentId) => {
        const requestId = ++glossaryRequestRef.current;
        setGlossaryLoading(true);

        try {
            const res = await fetch(
                `/api/glosarios/segmento/${segmentId}/coincidencias`,
                { 
                    headers: { Authorization: `Bearer ${jwt}` },
                }
            );

            // Si el usuario ya cambió de segmento, se ignora esta respuesta
            if (requestId !== glossaryRequestRef.current) return;

            setGlossaryMatches(res.ok ? await res.json() : []);
        } catch (error) {
            if (requestId === glossaryRequestRef.current) {
                setGlossaryMatches([]);
            }
            console.error('Error fetching glossary matches:', error);
        } finally {
            if (requestId === glossaryRequestRef.current) {
                setGlossaryLoading(false);
            }
        }
    };

    // Carga las coincidencias al abrir un segmento
    useEffect(() => {
        if (expandedId) {
            fetchGlossaryMatches(expandedId);
        } else {
            glossaryRequestRef.current++;
            setGlossaryMatches([]);
            setSelectionBtn(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expandedId]);

    // Oculta el botón flotante al hacer clic fuera o al hacer scroll
    useEffect(() => {
        if (!selectionBtn) return;

        const clear = (e) => {
            if (
                e.type === 'mousedown' &&
                e.target.closest &&
                e.target.closest('.glossary-selection-btn')
            ) {
                return;
            }
            setSelectionBtn(null);
        };

        document.addEventListener('mousedown', clear);
        window.addEventListener('scroll', clear, true);

        return () => {
            document.removeEventListener('mousedown', clear);
            window.removeEventListener('scroll', clear, true);
        };
    }, [selectionBtn]);

    // Selección de texto en el original del segmento expandido
    const handleOriginalMouseUp = (e) => {
        const selection = window.getSelection();

        if (
            !selection ||
            selection.rangeCount === 0 ||
            !e.currentTarget.contains(selection.anchorNode)
        ) {
            setSelectionBtn(null);
            return;
        }

        const text = selection.toString().replace(/\s+/g, ' ').trim();

        if (!text) {
            setSelectionBtn(null);
            return;
        }

        const rect = selection.getRangeAt(0).getBoundingClientRect();

        setSelectionBtn({
            text,
            x: rect.left + rect.width / 2,
            y: Math.max(rect.top, 48)
        });
    };

    const openManualEntry = () => {
        setGlossaryModal({
            open: true,
            id: null,
            origen: '',
            destino: '',
            lockOrigen: false
        });
    };

    const openEntryFromSelection = () => {
        if (!selectionBtn) return;

        setGlossaryModal({
            open: true,
            id: null,
            origen: selectionBtn.text,
            destino: '',
            lockOrigen: true
        });

        setSelectionBtn(null);
        window.getSelection()?.removeAllRanges();
        setActiveTab('GLOSARIO');
    };

    const openEditEntry = (entry) => {
        setGlossaryModal({
            open: true,
            id: entry.id,
            origen: entry.origen,
            destino: entry.destino,
            lockOrigen: false
        });
    };

    const closeGlossaryModal = () => {
        setGlossaryModal((prev) => ({ ...prev, open: false }));
    };

    // Función para CREAR o ACTUALIZAR
    const handleSaveEntry = async () => {
        const origen = glossaryModal.origen.trim();
        const destino = glossaryModal.destino.trim();

        if (!origen || !destino || isSavingEntry) return;

        setIsSavingEntry(true);

        const isEdit = glossaryModal.id !== null;
        
        // Rutas y métodos según EntradaGlosarioRestController.java
        const url = isEdit ? `/api/entradas/update/${glossaryModal.id}` : '/api/entradas/create';
        const method = isEdit ? 'PUT' : 'POST';
        
        // Payload (para actualizar no solemos enviar el proyectoId de nuevo)
        const bodyData = isEdit 
            ? { origen, destino } 
            : { origen, destino, proyectoId: Number(projectId) };

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (res.ok) {
                closeGlossaryModal();

                if (expandedId) {
                    // cache: 'no-store' asumimos que ya lo pusiste en el paso anterior
                    await fetchGlossaryMatches(expandedId); 
                }

                showToast(isEdit ? 'Entrada actualizada' : 'Entrada añadida', 'success');
            } else {
                const errorText = await res.text();
                showToast(
                    parseErrorMessage(errorText, isEdit ? 'No se pudo actualizar la entrada.' : 'No se pudo añadir la entrada.'),
                    'error'
                );
            }
        } catch (error) {
            showToast('Error de conexión con el servidor', 'error');
        } finally {
            setIsSavingEntry(false);
        }
    };

    // Nueva función para ELIMINAR
    const handleDeleteEntry = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar esta entrada del glosario?')) return;
        
        try {
            const res = await fetch(`/api/entradas/delete/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${jwt}` }
            });

            if (res.ok) {
                showToast('Entrada eliminada', 'success');
                if (expandedId) {
                    await fetchGlossaryMatches(expandedId);
                }
            } else {
                showToast('No se pudo eliminar la entrada.', 'error');
            }
        } catch (error) {
            showToast('Error de conexión con el servidor', 'error');
        }
    };

    // Añade la traducción sugerida al final del texto que se está escribiendo
    const insertGlossaryTerm = (term) => {
        setCurrentTranslation((prev) => {
            const base = prev || '';
            if (!base) return term;
            return /\s$/.test(base) ? base + term : `${base} ${term}`;
        });
    };

    const renderGlossaryTab = (isReadOnly) => {
        // 1. Agrupar las coincidencias por el término de origen (ignorando mayúsculas/minúsculas)
        const groupedMatches = glossaryMatches.reduce((acc, entry) => {
            const key = normalizeTerm(entry.origen);
            if (!acc[key]) {
                acc[key] = { origen: entry.origen, traducciones: [] };
            }
            acc[key].traducciones.push(entry);
            return acc;
        }, {});

        return (
            <div className="glossary-panel">
                {glossaryLoading ? (
                    <p className="glossary-empty">Cargando glosario...</p>
                ) : glossaryMatches.length === 0 ? (
                    <p className="glossary-empty">
                        No hay entradas del glosario para este segmento.
                    </p>
                ) : (
                    <ul className="glossary-list">
                        {/* 2. Renderizar los grupos en lugar de entradas sueltas */}
                        {Object.values(groupedMatches).map((group) => (
                            <li 
                                key={group.origen} 
                                className="glossary-item" 
                                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}
                            >
                                <span className="glossary-term">{group.origen}</span>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', paddingLeft: '8px' }}>
                                    {group.traducciones.map((entry) => (
                                        <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                            <span className="glossary-arrow">↳</span>
                                            <span className="glossary-translation">{entry.destino}</span>

                                            {!isReadOnly && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {/* Botón Principal: Insertar */}
                                                    <button
                                                        type="button"
                                                        className="status-action-btn btn-catlab-white small-btn"
                                                        onClick={() => insertGlossaryTerm(entry.destino)}
                                                        title="Insertar en la traducción"
                                                    >
                                                        Insertar
                                                    </button>

                                                    {/* Menú de 3 Puntos */}
                                                    <div className="glossary-menu-container">
                                                        <button
                                                            type="button"
                                                            className="glossary-menu-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setGlossaryMenuOpenId(
                                                                    glossaryMenuOpenId === entry.id ? null : entry.id
                                                                );
                                                            }}
                                                            title="Más opciones"
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                                <circle cx="12" cy="5" r="2.2" />
                                                                <circle cx="12" cy="12" r="2.2" />
                                                                <circle cx="12" cy="19" r="2.2" />
                                                            </svg>
                                                        </button>

                                                        {/* Menú Flotante Opciones */}
                                                        {glossaryMenuOpenId === entry.id && (
                                                            <div className="glossary-dropdown-menu">
                                                                <button
                                                                    type="button"
                                                                    className="glossary-dropdown-item"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setGlossaryMenuOpenId(null);
                                                                        openEditEntry(entry);
                                                                    }}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="glossary-dropdown-item danger"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setGlossaryMenuOpenId(null);
                                                                        handleDeleteEntry(entry.id);
                                                                    }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="glossary-footer">
                    <button
                        type="button"
                        className="status-action-btn btn-catlab-green small-btn"
                        onClick={openManualEntry}
                    >
                        + Nueva entrada
                    </button>
                </div>
            </div>
        );
    };
    // #endregion GLOSARIO

    const getButtonConfig = (estado) => {
        switch (estado) {
            case 'BORRADOR':
                return {
                    text: 'Traduced',
                    class: 'btn-catlab-green'
                };

            case 'TRADUCIDO':
                return {
                    text: 'Revised',
                    class: 'btn-catlab-green'
                };

            case 'REVISADO':
                return {
                    text: 'Draft',
                    class: 'btn-catlab-white'
                };

            default:
                return {
                    text: estado,
                    class: 'btn-catlab-white'
                };
        }
    };

    const renderFeedbackButton = (segment, feedbackText) => {
        if (!feedbackText) return null;
        if (isProjectPublished || isProjectCorrected) return null;

        const isOpen = feedbackPopupId === segment.id;

        return (
            <div className="feedback-button-container">
                <button
                    type="button"
                    className="feedback-trigger-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setFeedbackPopupId(isOpen ? null : segment.id);
                    }}
                    title="View reviewer feedback"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        width="20"
                        height="20"
                    >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="feedback-badge">!</span>
                </button>

                {isOpen && (
                    <div
                        className="feedback-popup"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="feedback-popup-header">
                            <h4>Reviewer Feedback</h4>
                            <button
                                type="button"
                                className="feedback-close-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFeedbackPopupId(null);
                                }}
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="feedback-popup-body">
                            {feedbackText}
                        </div>

                        <div className="feedback-popup-footer">
                            {expandedId !== segment.id && (
                                <button
                                    type="button"
                                    className="status-action-btn btn-catlab-green small-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFeedbackPopupId(null);
                                        handleExpand(segment);
                                    }}
                                >
                                    Edit Translation
                                </button>
                            )}

                            <button
                                type="button"
                                className="status-action-btn btn-catlab-white small-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFeedbackPopupId(null);
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="translate-page">

            <header className="translate-header">

                <h2 className="translate-doc-title">
                    {project?.documento?.nombreOriginal ||
                        'project-name.pdf'}
                </h2>

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate('/my-projects')
                    }
                >
                    Volver
                </button>

            </header>

            <div className="segments-container">

                {segments.map((segment) => {

                    const isExpanded =
                        !isProjectPublished &&
                        expandedId === segment.id;

                    const config =
                        STATUS_CONFIG[
                            segment.estado
                        ] || {
                            colorClass:
                                'status-draft',
                            label:
                                segment.estado
                        };

                    const isReadOnly =
                        isProjectCorrected ||
                        segment.estado === 'REVISADO';

                    const btnConfig =
                        getButtonConfig(
                            segment.estado
                        );

                    const feedbackText =
                        segment.feedback ||
                        segment.comentario;

                    if (isProjectCorrected) {
                        return (
                            <div
                                key={segment.id}
                                className={`segment-card read-only-card ${config.colorClass}`}
                                style={{
                                    cursor: 'default'
                                }}
                            >
                                <div className="segment-collapsed">

                                    <div className="segment-collapsed-body">

                                        <div
                                            className="segment-content-clickable"
                                            style={{
                                                cursor: 'default'
                                            }}
                                        >
                                            <div className="segment-text original">
                                                {segment.textoOriginal}
                                            </div>

                                            <div className="segment-text translation read-only-translation">
                                                {segment.textoTraducido || ''}
                                            </div>
                                        </div>

                                        {feedbackText && (
                                            <div className="segment-feedback-preview">
                                                <span className="feedback-tag">
                                                    Feedback:
                                                </span>{' '}
                                                {feedbackText}
                                            </div>
                                        )}

                                    </div>

                                    <div className="segment-actions-collapsed">
                                        <span
                                            className={`segment-status-badge ${config.colorClass}`}
                                        >
                                            {config.label}
                                        </span>
                                    </div>

                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={segment.id}

                            className={`
                                segment-card
                                ${
                                    isProjectPublished
                                        ? 'published-card'
                                        : isProjectCorrected
                                            ? 'status-corrected'
                                            : config.colorClass
                                }
                                ${isExpanded ? 'expanded' : ''}
                                ${feedbackPopupId === segment.id ? 'has-open-popup' : ''}
                            `}

                            onClick={() =>
                                handleExpand(segment)
                            }
                        >

                            {!isExpanded ? (
                                <div className="segment-collapsed">
                                    <div className="segment-content-clickable">
                                        <div className="segment-text original">
                                            {segment.textoOriginal}
                                        </div>

                                        <div className="segment-text translation">
                                            {segment.textoTraducido || ''}
                                        </div>
                                    </div>

                                    {!isProjectPublished && (
                                        <div className="segment-actions-collapsed">
                                            {/* 1. Botón de Feedback (A LA IZQUIERDA DEL ESTADO) */}
                                            {renderFeedbackButton(segment, feedbackText)}

                                            {/* 2. Etiqueta de Estado */}
                                            <span className={`segment-status-badge ${config.colorClass}`}>
                                                {config.label}
                                            </span>

                                            {/* 3. Botón de cambio de estado */}
                                            <button 
                                                className={`status-action-btn ${btnConfig.class}`}
                                                onClick={(e) => handleStatusAction(e, segment)}
                                            >
                                                {btnConfig.text}
                                            </button>
                                        </div>
                                    )}

                                    {isProjectCorrected && feedbackText && (
                                        <div className="segment-feedback-preview">
                                            <span className="feedback-tag">Feedback:</span>{' '}
                                            {feedbackText}
                                        </div>
                                    )}
                                </div>
                            ) : (

                                <div
                                    className="segment-expanded"
                                    onClick={(e) =>
                                        e.stopPropagation()
                                    }
                                >

                                    <button
                                        className="segment-close-subtle"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedId(null);
                                        }}
                                        title="Cerrar detalles (Esc)"
                                    >
                                        ✕
                                    </button>

                                    <div className="segment-editor-row">

                                        <div className="segment-text original"
                                        onMouseUp={handleOriginalMouseUp}
                                        >
                                            {
                                                segment.textoOriginal
                                            }
                                        </div>

                                        <div className="segment-arrow">
                                            →
                                        </div>

                                        <div className="segment-input-section">

                                            <div
                                                className={`
                                                    chat-input-wrapper
                                                    ${
                                                        isReadOnly
                                                            ? 'readonly'
                                                            : ''
                                                    }
                                                `}
                                            >

                                                <textarea
                                                    className="chat-textarea"
                                                    value={
                                                        currentTranslation
                                                    }
                                                    onChange={(e) =>
                                                        setCurrentTranslation(
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={(e) => {

                                                        if (
                                                            e.key ===
                                                                'Enter' &&
                                                            !e.shiftKey
                                                        ) {
                                                            e.preventDefault();

                                                            if (
                                                                !isSaving &&
                                                                !isReadOnly &&
                                                                currentTranslation.trim()
                                                            ) {
                                                                handleSaveTranslation(
                                                                    segment.id,
                                                                    currentTranslation
                                                                );
                                                            }
                                                        }

                                                    }}
                                                    disabled={
                                                        isReadOnly
                                                    }
                                                    placeholder={
                                                        isReadOnly
                                                            ? 'Traducción'
                                                            : 'Introduce la traducción aquí (Enter para guardar, Shift+Enter para nueva línea)...'
                                                    }
                                                    rows={3}
                                                    autoFocus
                                                />

                                                {!isReadOnly && (
                                                    <button
                                                        className="chat-send-btn"
                                                        onClick={() =>
                                                            handleSaveTranslation(
                                                                segment.id,
                                                                currentTranslation
                                                            )
                                                        }
                                                        disabled={
                                                            isSaving ||
                                                            !currentTranslation.trim()
                                                        }
                                                        title="Guardar traducción"
                                                    >

                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            width="20"
                                                            height="20"
                                                            style={{
                                                                transform:
                                                                    'translateX(-2px) translateY(1px)'
                                                            }}
                                                        >
                                                            <line
                                                                x1="22"
                                                                y1="2"
                                                                x2="11"
                                                                y2="13"
                                                            />

                                                            <polygon
                                                                points="22 2 15 22 11 13 2 9 22 2"
                                                            />

                                                        </svg>

                                                    </button>
                                                )}

                                            </div>

                                           <div className="segment-actions">

                                                {/* 1. Botón de Feedback (A LA IZQUIERDA DEL ESTADO) */}
                                                {renderFeedbackButton(segment, feedbackText)}

                                                {/* 2. Etiqueta de Estado */}
                                                <span
                                                    className={
                                                        isProjectCorrected
                                                            ? 'segment-status-badge'
                                                            : `segment-status-badge ${config.colorClass}`
                                                    }
                                                    style={
                                                        isProjectCorrected
                                                            ? {
                                                                backgroundColor: '#dbeafe',
                                                                color: '#2563eb',
                                                                border: '1px solid #93c5fd'
                                                            }
                                                            : undefined
                                                    }
                                                >
                                                    {isProjectCorrected ? 'Corrected' : config.label}
                                                </span>

                                                {/* 3. Botón de cambio de estado */}
                                                {!isProjectCorrected && (
                                                    <button
                                                        className={`status-action-btn ${btnConfig.class}`}
                                                        onClick={(e) => handleStatusAction(e, segment)}
                                                    >
                                                        {btnConfig.text}
                                                    </button>
                                                )}

                                            </div>

                                        </div>

                                    </div>

                                    {isProjectCorrected && (
                                        <div
                                            className="teacher-feedback-section"
                                            style={{
                                                marginTop:
                                                    '20px'
                                            }}
                                        >

                                            <label className="teacher-field-label">
                                                Teacher Feedback
                                            </label>

                                            <div className="chat-input-wrapper readonly">

                                                <div
                                                    className="chat-textarea"
                                                    style={{
                                                        minHeight:
                                                            '70px',
                                                        whiteSpace:
                                                            'pre-wrap',
                                                        cursor:
                                                            'default',
                                                        padding:
                                                            '12px',
                                                        color:
                                                            '#334155',
                                                        display:
                                                            'block'
                                                    }}
                                                >
                                                    {
                                                        feedbackText ||
                                                        'No feedback provided.'
                                                    }
                                                </div>

                                            </div>

                                        </div>
                                    )}

                                    <div className="segment-tools">

                                        <div className="tools-tabs">

                                            <button
                                                className={`
                                                    tool-tab
                                                    ${
                                                        activeTab ===
                                                        'TM'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                `}
                                                onClick={() =>
                                                    setActiveTab(
                                                        'TM'
                                                    )
                                                }
                                            >
                                                TM
                                            </button>

                                            <button
                                                className={`
                                                    tool-tab
                                                    ${
                                                        activeTab ===
                                                        'GLOSARIO'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                `}
                                                onClick={() =>
                                                    setActiveTab(
                                                        'GLOSARIO'
                                                    )
                                                }
                                            >
                                                Glosario
                                            </button>

                                        </div>

                                        <div className={`tools-content ${activeTab === 'GLOSARIO' ? 'glossary-content' : ''}`}>

                                            {activeTab === 'GLOSARIO' ? (
                                                renderGlossaryTab(isReadOnly)
                                            ) : (
                                                <div className="not-implemented-msg">
                                                    <p>
                                                        La funcionalidad de{' '}
                                                        <strong>{activeTab}</strong>{' '}
                                                        está por implementar.
                                                    </p>
                                                </div>
                                            )}

                                        </div>

                                    </div>

                                </div>

                            )}

                        </div>
                    );
                })}

            </div>

            {canShowPublishBtn && (
                <div className="publish-container">

                    <button
                        className="status-action-btn btn-catlab-green publish-project-btn"
                        onClick={
                            handlePublishProject
                        }
                        disabled={
                            isPublishing
                        }
                    >
                        {
                            isPublishing
                                ? 'Publicando...'
                                : 'Publicar Proyecto'
                        }
                    </button>

                </div>
            )}

            {selectionBtn && (
                <button
                    type="button"
                    className="glossary-selection-btn"
                    style={{ top: selectionBtn.y, left: selectionBtn.x }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={openEntryFromSelection}
                >
                    + Añadir al glosario
                </button>
            )}

            {glossaryModal.open && (
                <div
                    className="glossary-modal-overlay"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.stopPropagation();
                            closeGlossaryModal();
                        }
                    }}
                >
                    <div
                        className="glossary-modal"
                        role="dialog"
                        aria-modal="true"
                    >
                        <h3 className="glossary-modal-title">
                            {glossaryModal.id ? 'Editar entrada' : 'Nueva entrada del glosario'}
                        </h3>

                        <label className="glossary-label">Origen</label>
                        <input
                            className="glossary-input"
                            type="text"
                            value={glossaryModal.origen}
                            readOnly={glossaryModal.lockOrigen}
                            autoFocus={!glossaryModal.lockOrigen}
                            onChange={(e) =>
                                setGlossaryModal((prev) => ({
                                    ...prev,
                                    origen: e.target.value
                                }))
                            }
                            placeholder="Término en el idioma original"
                        />

                        <label className="glossary-label">Destino</label>
                        <input
                            className="glossary-input"
                            type="text"
                            value={glossaryModal.destino}
                            autoFocus={glossaryModal.lockOrigen}
                            onChange={(e) =>
                                setGlossaryModal((prev) => ({
                                    ...prev,
                                    destino: e.target.value
                                }))
                            }
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveEntry();
                                }
                            }}
                            placeholder="Traducción"
                        />

                        <div className="glossary-modal-footer">
                            <button
                                type="button"
                                className="status-action-btn btn-catlab-white small-btn"
                                onClick={closeGlossaryModal}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="status-action-btn btn-catlab-green small-btn"
                                onClick={handleSaveEntry}
                                disabled={
                                    isSavingEntry ||
                                    !glossaryModal.origen.trim() ||
                                    !glossaryModal.destino.trim()
                                }
                            >
                                {isSavingEntry ? 'Guardando...' : (glossaryModal.id ? 'Guardar' : 'Añadir')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast.visible && (
                <div
                    className={`
                        toast-notification
                        toast-${toast.type}
                    `}
                >
                    <div className="toast-text">
                        {
                            toast.message
                        }
                    </div>
                </div>
            )}

        </div>
    );
}