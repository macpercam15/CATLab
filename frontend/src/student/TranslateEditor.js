import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tokenService from '../services/token.service';
import '../static/css/student/TranslateEditor.css';

const STATUS_COLORS = {
    BORRADOR: 'status-draft',
    TRADUCIDO: 'status-traduced',
    REVISADO: 'status-revised',
    PUBLICADO: 'status-published',
    CORREGIDO: 'status-corrected'
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
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        fetchProjectData();
        fetchSegments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

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
        if (expandedId === segment.id) return;
        setExpandedId(segment.id);
        setCurrentTranslation(segment.textoTraducido || '');
        setActiveTab('TM');
        setSaveSuccess(false);
    };

    // Guarda el texto sin cambiar el estado del segmento[cite: 11]
    const handleSaveTranslation = async (segmentId, text) => {
        if (!text.trim()) return;
        setIsSaving(true);
        setSaveSuccess(false);
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
                setSaveSuccess(true);
                await fetchSegments();
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        } catch (error) {
            console.error("Error saving translation:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Cambia el estado del flujo (Draft -> Traduced -> Revised -> Draft)[cite: 13]
    const handleStatusAction = async (e, segment) => {
        e.stopPropagation(); 
        
        // Si hay texto no guardado, lo guardamos antes de cambiar de estado
        if (segment.estado !== 'REVISADO' && currentTranslation !== segment.textoTraducido) {
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
                }
            } catch (error) {
                console.error("Error updating status:", error);
            }
        }
    };

    const getButtonConfig = (estado) => {
        switch (estado) {
            case 'BORRADOR': return { text: 'Traduced', class: 'btn-traduced' };
            case 'TRADUCIDO': return { text: 'Revised', class: 'btn-revised' };
            case 'REVISADO': return { text: 'Draft', class: 'btn-draft' };
            default: return { text: estado, class: 'btn-draft' };
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
                    const isExpanded = expandedId === segment.id;
                    const statusClass = STATUS_COLORS[segment.estado] || 'status-draft';
                    const isReadOnly = segment.estado === 'REVISADO';

                    return (
                        <div 
                            key={segment.id} 
                            className={`segment-card ${statusClass} ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => handleExpand(segment)}
                        >
                            {!isExpanded ? (
                                <div className="segment-collapsed">
                                    <div className="segment-text original">{segment.textoOriginal}</div>
                                    <div className="segment-text translation">{segment.textoTraducido || ''}</div>
                                </div>
                            ) : (
                                <div className="segment-expanded" onClick={(e) => e.stopPropagation()}>
                                    <div className="segment-editor-row">
                                        <div className="segment-text original">{segment.textoOriginal}</div>
                                        
                                        <div className="segment-arrow">→</div>
                                        
                                        <div className="segment-input-section">
                                            {/* WhatsApp-style Input Wrapper */}
                                            <div className={`chat-input-wrapper ${isReadOnly ? 'readonly' : ''}`}>
                                                <textarea
                                                    className="chat-textarea"
                                                    value={currentTranslation}
                                                    onChange={(e) => setCurrentTranslation(e.target.value)}
                                                    disabled={isReadOnly}
                                                    placeholder="Introduce la traducción aquí..."
                                                    rows={3}
                                                />
                                                {!isReadOnly && (
                                                    <button 
                                                        className={`chat-send-btn ${saveSuccess ? 'saved' : ''}`}
                                                        onClick={() => handleSaveTranslation(segment.id, currentTranslation)}
                                                        disabled={isSaving || !currentTranslation.trim()}
                                                        title="Guardar traducción"
                                                    >
                                                        {saveSuccess ? (
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                        ) : (
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" style={{ transform: 'translateX(-2px) translateY(1px)' }}>
                                                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                                            </svg>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Status Action Button Wrapper */}
                                            <div className="segment-actions">
                                                <button 
                                                    className={`status-action-btn ${getButtonConfig(segment.estado).class}`}
                                                    onClick={(e) => handleStatusAction(e, segment)}
                                                >
                                                    {getButtonConfig(segment.estado).text}
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
        </div>
    );
}