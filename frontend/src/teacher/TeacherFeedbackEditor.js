import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tokenService from '../services/token.service';
import '../static/css/teacher/teacherFeedbackEditor.css';

const TEACHER_STATUS_CONFIG = {
    PUBLICADO: { colorClass: 'status-pending', label: 'Pending' },
    CORREGIDO: { colorClass: 'status-graded', label: 'Graded' },
    BORRADOR: { colorClass: 'status-pending', label: 'Pending' },
    TRADUCIDO: { colorClass: 'status-pending', label: 'Pending' },
    REVISADO: { colorClass: 'status-pending', label: 'Pending' }
};

export default function TeacherTranslateEditor() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const jwt = tokenService.getLocalAccessToken();

    const [project, setProject] = useState(null);
    const [segments, setSegments] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [currentFeedback, setCurrentFeedback] = useState('');
    const [isSavingFeedback, setIsSavingFeedback] = useState(false);
    
    const [toast, setToast] = useState({ visible: false, message: '', type: '' });

    const isProjectGraded = project?.estado === 'CORREGIDO';

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
        if (expandedId === segment.id) return;
        setExpandedId(segment.id);
        setCurrentFeedback(segment.feedback || segment.comentario || '');
    };

    const handleSaveFeedback = async (segmentId, text) => {
        setIsSavingFeedback(true);
        try {
            const res = await fetch(`/api/segmentos/feedback/${segmentId}`, {
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
                showToast('Feedback saved successfully', 'success');
            } else {
                const errorText = await res.text();
                const friendlyMsg = parseErrorMessage(errorText, 'Could not save feedback.');
                showToast(friendlyMsg, 'error');
            }
        } catch (error) {
            showToast('Server connection error', 'error');
        } finally {
            setIsSavingFeedback(false);
        }
    };

    const handleSegmentStatusToggle = async (e, segment) => {
        e.stopPropagation();
        
        const targetStatus = segment.estado === 'CORREGIDO' ? 'PUBLICADO' : 'CORREGIDO';
        const endpoint = `/api/segmentos/estado/${segment.id}`;

        try {
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: targetStatus })
            });
            if (res.ok) {
                await fetchSegments();
            } else {
                const errorText = await res.text();
                const friendlyMsg = parseErrorMessage(errorText, 'Could not change segment status.');
                showToast(friendlyMsg, 'error');
            }
        } catch (error) {
            showToast('Server connection error', 'error');
        }
    };

    const handleProjectStatusToggle = async () => {
        const action = isProjectGraded ? 'CANCEL' : 'SEND';
        const endpoint = action === 'SEND'
            ? `/api/proyectos/profesor/grade/${projectId}`
            : `/api/proyectos/profesor/cancel-grade/${projectId}`;

        try {
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${jwt}` }
            });
            if (res.ok) {
                showToast(
                    action === 'SEND' ? 'Project marked as Graded' : 'Project status reset to Pending',
                    'success'
                );
                await fetchProjectData();
                await fetchSegments();
            } else {
                const errorText = await res.text();
                const friendlyMsg = parseErrorMessage(errorText, 'Could not update project status.');
                showToast(friendlyMsg, 'error');
            }
        } catch (error) {
            showToast('Server connection error', 'error');
        }
    };

    return (
        <div className="translate-page teacher-editor-page">
            <header className="translate-header">
                <h2 className="translate-doc-title">
                    {project?.name || project?.documento?.nombreOriginal || 'project-name.pdf'}
                </h2>
                <button className="back-btn" onClick={() => navigate('/teacher/projects')}>
                    Back
                </button>
            </header>

            <div className="segments-container">
                {segments.map((segment) => {
                    const isExpanded = expandedId === segment.id;
                    const statusKey = segment.estado === 'CORREGIDO' ? 'CORREGIDO' : 'PUBLICADO';
                    const config = TEACHER_STATUS_CONFIG[statusKey];
                    const isGraded = segment.estado === 'CORREGIDO';
                    const feedbackText = segment.feedback || segment.comentario;

                    return (
                        <div 
                            key={segment.id} 
                            className={`segment-card ${config.colorClass} ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => handleExpand(segment)}
                        >
                            {!isExpanded ? (
                                <div className="segment-collapsed">
                                    <div className="segment-collapsed-body">
                                        <div className="segment-content-clickable">
                                            <div className="segment-text original">{segment.textoOriginal}</div>
                                            <div className="segment-text translation read-only-translation">
                                                {segment.textoTraducido || '(No translation provided)'}
                                            </div>
                                        </div>

                                        {feedbackText && (
                                            <div className="segment-feedback-preview">
                                                <span className="feedback-tag">Feedback:</span> {feedbackText}
                                            </div>
                                        )}
                                    </div>

                                    <span className={`segment-status-badge ${config.colorClass}`}>
                                        {config.label}
                                    </span>

                                    <div className="segment-actions-collapsed">
                                        <button 
                                            className={`status-action-btn ${isGraded ? 'btn-catlab-white' : 'btn-teacher-blue'}`}
                                            onClick={(e) => handleSegmentStatusToggle(e, segment)}
                                        >
                                            {isGraded ? 'Cancel' : 'Grade'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="segment-expanded" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        className="segment-close-subtle" 
                                        onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                                        title="Close details (Esc)"
                                    >
                                        ✕
                                    </button>

                                    <div className="segment-editor-row">
                                        <div className="segment-text original">{segment.textoOriginal}</div>
                                        
                                        <div className="segment-arrow">→</div>
                                        
                                        <div className="segment-input-section">
                                            <div className="student-translation-box">
                                                <label className="teacher-field-label">Student Translation</label>
                                                <div className="student-translation-content">
                                                    {segment.textoTraducido || '(No translation provided)'}
                                                </div>
                                            </div>

                                            <div className="segment-actions">
                                                <span className={`segment-status-badge ${config.colorClass}`}>
                                                    {config.label}
                                                </span>
                                                <button 
                                                    className={`status-action-btn ${isGraded ? 'btn-catlab-white' : 'btn-teacher-blue'}`}
                                                    onClick={(e) => handleSegmentStatusToggle(e, segment)}
                                                >
                                                    {isGraded ? 'Cancel' : 'Grade'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="teacher-feedback-section">
                                        <label className="teacher-field-label">Teacher Feedback</label>
                                        <div className="chat-input-wrapper">
                                            <textarea
                                                className="chat-textarea"
                                                value={currentFeedback}
                                                onChange={(e) => setCurrentFeedback(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        if (!isSavingFeedback) {
                                                            handleSaveFeedback(segment.id, currentFeedback);
                                                        }
                                                    }
                                                }}
                                                placeholder="Type feedback for this segment (Enter to save, Shift+Enter for new line)..."
                                                rows={2}
                                                autoFocus
                                            />
                                            <button 
                                                className="chat-send-btn teacher-send-btn"
                                                onClick={() => handleSaveFeedback(segment.id, currentFeedback)}
                                                disabled={isSavingFeedback}
                                                title="Save Feedback"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" style={{ transform: 'translateX(-2px) translateY(1px)' }}>
                                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="publish-container">
                <button 
                    className={`status-action-btn ${isProjectGraded ? 'btn-catlab-white' : 'btn-teacher-blue'} publish-project-btn`}
                    onClick={handleProjectStatusToggle}
                >
                    {isProjectGraded ? 'Cancel Grading' : 'Mark Project as Graded'}
                </button>
            </div>

            {toast.visible && (
                <div className={`toast-notification toast-${toast.type}`}>
                    <div className="toast-text">{toast.message}</div>
                </div>
            )}
        </div>
    );
}