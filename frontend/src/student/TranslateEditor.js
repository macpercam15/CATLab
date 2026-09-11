import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tokenService from '../services/token.service';
import '../static/css/student/TranslateEditor.css';

const STATUS_CONFIG = {
    BORRADOR: { colorClass: 'status-draft', label: 'Draft' },
    TRADUCIDO: { colorClass: 'status-traduced', label: 'Traduced' },
    REVISADO: { colorClass: 'status-revised', label: 'Revised' },
    PUBLICADO: { colorClass: 'status-published', label: 'Published' },
    CORREGIDO: { colorClass: 'status-corrected', label: 'Corrected' }
};

export default function TranslateEditor() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const jwt = tokenService.getLocalAccessToken();

    const [project, setProject] = useState(null);
    const [segments, setSegments] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [currentTranslation, setCurrentTranslation] = useState('');
    const [activeTab, setActiveTab] = useState('TM');
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    
    const [toast, setToast] = useState({ visible: false, message: '', type: '' });

    // Comprobaciones del estado del proyecto
    const isProjectPublished = project?.estado === 'PUBLICADO';
    const canShowPublishBtn = project?.estado !== 'PUBLICADO' && project?.estado !== 'CORREGIDO';

    useEffect(() => {
        fetchProjectData();
        fetchSegments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setExpandedId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const showToast = (message, type = 'error') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: '' }), 4000);
    };

    const parseErrorMessage = (rawText, fallbackMsg) => {
        if (!rawText) return fallbackMsg;
        try {
            const parsed = JSON.parse(rawText);
            if (parsed.message) return parsed.message;
        } catch (e) {
            if (rawText.includes('<html') || rawText.includes('<!DOCTYPE')) {
                return fallbackMsg;
            }
        }
        const cleaned = rawText.replace(/<[^>]*>?/gm, '').trim();
        return (cleaned.length > 80 || cleaned.includes('{')) ? fallbackMsg : cleaned;
    };

    const fetchProjectData = async () => {
        try {
            const res = await fetch(`/api/proyectos/${projectId}`, {
                headers: { 'Authorization': `Bearer ${jwt}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProject(data);
            }
        } catch (error) {
            console.error("Error fetching project:", error);
        }
    };

    const fetchSegments = async () => {
        try {
            const res = await fetch(`/api/segmentos/proyecto/${projectId}`, {
                headers: { 'Authorization': `Bearer ${jwt}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSegments(data);
            }
        } catch (error) {
            console.error("Error fetching segments:", error);
        }
    };

    const handleExpand = (segment) => {
        if (isProjectPublished || expandedId === segment.id) return;
        setExpandedId(segment.id);
        setCurrentTranslation(segment.textoTraducido || '');
        setActiveTab('TM');
    };

    const handleSaveTranslation = async (segmentId, text) => {
        if (!text.trim()) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/segmentos/traducir/${segmentId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'text/plain'
                },
                body: text
            });
            if (res.ok) {
                await fetchSegments();
                setExpandedId(null);
                showToast('Traducción guardada correctamente', 'success');
            } else {
                const errorText = await res.text();
                const friendlyMsg = parseErrorMessage(errorText, 'No se pudo guardar la traducción.');
                showToast(friendlyMsg, 'error');
            }
        } catch (error) {
            showToast('Error de conexión con el servidor', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusAction = async (e, segment) => {
        e.stopPropagation(); 
        
        if (segment.estado !== 'REVISADO' && currentTranslation !== segment.textoTraducido && expandedId === segment.id) {
            await handleSaveTranslation(segment.id, currentTranslation);
        }

        let endpoint = '';
        if (segment.estado === 'BORRADOR') {
            endpoint = `/api/segmentos/marcarTraducido/${segment.id}`;
        } else if (segment.estado === 'TRADUCIDO') {
            endpoint = `/api/segmentos/marcarRevisado/${segment.id}`;
        } else if (segment.estado === 'REVISADO') {
            endpoint = `/api/segmentos/marcarBorrador/${segment.id}`;
        }

        if (endpoint) {
            try {
                const res = await fetch(endpoint, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${jwt}` }
                });
                if (res.ok) {
                    await fetchSegments();
                } else {
                    const errorText = await res.text();
                    const friendlyMsg = parseErrorMessage(
                        errorText, 
                        'Debes introducir una traducción antes de marcar el segmento como traducido.'
                    );
                    showToast(friendlyMsg, 'error');
                }
            } catch (error) {
                showToast('Error de conexión con el servidor', 'error');
            }
        }
    };

    const handlePublishProject = async () => {
        setIsPublishing(true);
        try {
            const res = await fetch(`/api/proyectos/publish/${projectId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${jwt}` }
            });
            if (res.ok) {
                showToast('Proyecto publicado correctamente', 'success');
                await fetchProjectData();
                await fetchSegments();
            } else {
                const errorText = await res.text();
                const friendlyMsg = parseErrorMessage(errorText, 'No se pudo publicar el proyecto. Verifica que todos los segmentos estén listos.');
                showToast(friendlyMsg, 'error');
            }
        } catch (error) {
            showToast('Error de conexión con el servidor', 'error');
        } finally {
            setIsPublishing(false);
        }
    };

    const getButtonConfig = (estado) => {
        switch (estado) {
            case 'BORRADOR': return { text: 'Traduced', class: 'btn-catlab-green' };
            case 'TRADUCIDO': return { text: 'Revised', class: 'btn-catlab-green' };
            case 'REVISADO': return { text: 'Draft', class: 'btn-catlab-white' };
            default: return { text: estado, class: 'btn-catlab-white' };
        }
    };

    return (
        <div className="translate-page">
            <header className="translate-header">
                <h2 className="translate-doc-title">
                    {project?.documento?.nombreOriginal || 'project-name.pdf'}
                </h2>
                <button className="back-btn" onClick={() => navigate('/my-projects')}>
                    Volver
                </button>
            </header>

            <div className="segments-container">
                {segments.map((segment) => {
                    const isExpanded = !isProjectPublished && expandedId === segment.id;
                    const config = STATUS_CONFIG[segment.estado] || { colorClass: 'status-draft', label: segment.estado };
                    const isReadOnly = segment.estado === 'REVISADO';
                    const btnConfig = getButtonConfig(segment.estado);

                    return (
                        <div 
                            key={segment.id} 
                            className={`segment-card ${isProjectPublished ? 'read-only-card' : config.colorClass} ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => handleExpand(segment)}
                        >
                            {!isExpanded ? (
                                <div className="segment-collapsed">
                                    <div className="segment-content-clickable">
                                        <div className="segment-text original">{segment.textoOriginal}</div>
                                        <div className="segment-text translation">{segment.textoTraducido || ''}</div>
                                    </div>

                                    {/* Si el proyecto está PUBLICADO, ocultamos estados y botones */}
                                    {!isProjectPublished && (
                                        <>
                                            <span className={`segment-status-badge ${config.colorClass}`}>
                                                {config.label}
                                            </span>

                                            <div className="segment-actions-collapsed">
                                                <button 
                                                    className={`status-action-btn ${btnConfig.class}`}
                                                    onClick={(e) => handleStatusAction(e, segment)}
                                                >
                                                    {btnConfig.text}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="segment-expanded" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        className="segment-close-subtle" 
                                        onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                                        title="Cerrar detalles (Esc)"
                                    >
                                        ✕
                                    </button>

                                    <div className="segment-editor-row">
                                        <div className="segment-text original">{segment.textoOriginal}</div>
                                        
                                        <div className="segment-arrow">→</div>
                                        
                                        <div className="segment-input-section">
                                            <div className={`chat-input-wrapper ${isReadOnly ? 'readonly' : ''}`}>
                                                <textarea
                                                    className="chat-textarea"
                                                    value={currentTranslation}
                                                    onChange={(e) => setCurrentTranslation(e.target.value)}
                                                    disabled={isReadOnly}
                                                    placeholder="Introduce la traducción aquí..."
                                                    rows={3}
                                                    autoFocus
                                                />
                                                {!isReadOnly && (
                                                    <button 
                                                        className="chat-send-btn"
                                                        onClick={() => handleSaveTranslation(segment.id, currentTranslation)}
                                                        disabled={isSaving || !currentTranslation.trim()}
                                                        title="Guardar traducción"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" style={{ transform: 'translateX(-2px) translateY(1px)' }}>
                                                            <line x1="22" y1="2" x2="11" y2="13"></line>
                                                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="segment-actions">
                                                <span className={`segment-status-badge ${config.colorClass}`}>
                                                    {config.label}
                                                </span>
                                                <button 
                                                    className={`status-action-btn ${btnConfig.class}`}
                                                    onClick={(e) => handleStatusAction(e, segment)}
                                                >
                                                    {btnConfig.text}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="segment-tools">
                                        <div className="tools-tabs">
                                            <button 
                                                className={`tool-tab ${activeTab === 'TM' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('TM')}
                                            >
                                                TM
                                            </button>
                                            <button 
                                                className={`tool-tab ${activeTab === 'GLOSARIO' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('GLOSARIO')}
                                            >
                                                Glosario
                                            </button>
                                        </div>
                                        <div className="tools-content">
                                            <div className="not-implemented-msg">
                                                <p>La funcionalidad de <strong>{activeTab}</strong> está por implementar.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Botón de publicar al final del proyecto si no está publicado ni corregido */}
            {canShowPublishBtn && (
                <div className="publish-container">
                    <button 
                        className="status-action-btn btn-catlab-green publish-project-btn"
                        onClick={handlePublishProject}
                        disabled={isPublishing}
                    >
                        {isPublishing ? 'Publicando...' : 'Publicar Proyecto'}
                    </button>
                </div>
            )}

            {toast.visible && (
                <div className={`toast-notification toast-${toast.type}`}>
                    <div className="toast-text">{toast.message}</div>
                </div>
            )}
        </div>
    );
}