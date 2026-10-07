import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../static/css/tm/tm.css';
import tokenService from '../../services/token.service';

export default function MyTus() {
    const { tmId } = useParams();
    const navigate = useNavigate();
    const jwt = tokenService.getLocalAccessToken();

    const [tmDetails, setTmDetails] = useState(null);
    const [tus, setTus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modales
    const [tuModalOpen, setTuModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTuId, setCurrentTuId] = useState(null);
    
    // Formulario
    const [origenForm, setOrigenForm] = useState('');
    const [destinoForm, setDestinoForm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    // Eliminar
    const [tuToDelete, setTuToDelete] = useState(null);

    useEffect(() => {
        if (!jwt) {
            setError('Usuario no autenticado.');
            setLoading(false);
            return;
        }

        // Obtener la TM
        fetch(`/api/tm/${tmId}`, {
            headers: { 'Authorization': `Bearer ${jwt}` }
        })
        .then(res => res.ok ? res.json() : Promise.reject('Error al obtener la TM'))
        .then(data => setTmDetails(data))
        .catch(err => setError(err));

        // Obtener las TUs
        fetch(`/api/tm/${tmId}/tus`, {
            headers: { 'Authorization': `Bearer ${jwt}` }
        })
        .then(res => res.ok ? res.json() : Promise.reject('Error al obtener las TUs'))
        .then(data => {
            setTus(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(err => {
            setError(err);
            setLoading(false);
        });
    }, [tmId, jwt]);

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentTuId(null);
        setOrigenForm('');
        setDestinoForm('');
        setMessage(null);
        setTuModalOpen(true);
    };

    const openEditModal = (tu) => {
        setIsEditing(true);
        setCurrentTuId(tu.id);
        setOrigenForm(tu.origen || '');
        setDestinoForm(tu.destino || '');
        setMessage(null);
        setTuModalOpen(true);
    };

    const closeTuModal = () => {
        setTuModalOpen(false);
        setSubmitting(false);
        setMessage(null);
    };

    const handleTuSubmit = async (e) => {
        e.preventDefault();
        
        if (!origenForm.trim() || !destinoForm.trim()) {
            setMessage('Ambos campos son obligatorios.');
            return;
        }

        setSubmitting(true);
        const endpoint = isEditing ? `/api/tm/tu/edit/${currentTuId}` : `/api/tm/tu/create/${tmId}`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ origen: origenForm, destino: destinoForm }),
            });

            if (response.ok) {
                const savedTu = await response.json();
                if (isEditing) {
                    setTus(tus.map(t => t.id === savedTu.id ? savedTu : t));
                } else {
                    setTus([...tus, savedTu]);
                }
                closeTuModal();
            } else {
                const responseText = await response.text();
                let errorMessage = 'Error al guardar la TU.';

                if (responseText) {
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || responseText;
                    } catch {
                        errorMessage = responseText;
                    }
                }

                setMessage(errorMessage);
            }
        } catch (error) {
            setMessage('Error de conexión con el servidor.');
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!tuToDelete) return;

        try {
            const response = await fetch(`/api/tm/tu/delete/${tuToDelete.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${jwt}` },
            });

            if (response.ok) {
                setTus(tus.filter(t => t.id !== tuToDelete.id));
                setTuToDelete(null);
            } else {
                alert('Error al eliminar la TU');
            }
        } catch (error) {
            alert('Error al conectar con el servidor.');
        }
    };

    const idiomaA = tmDetails?.idiomaA?.codigo || 'A';
    const idiomaB = tmDetails?.idiomaB?.codigo || 'B';

    return (
        <div className="tm-page">
            <div className="tm-shell">
                <button className="tm-back-link" onClick={() => navigate(-1)}>
                    ← Back to My TMs
                </button>

                <header className="tm-header">
                    <div className="tm-header-title-box">
                        <h1 className="tm-title">
                            {tmDetails ? tmDetails.name : 'Translation Memory'}
                        </h1>
                        <span className="tm-subtitle">
                            Languages: {idiomaA} ↔ {idiomaB}
                        </span>
                    </div>
                    <button className="tm-new-btn" onClick={openCreateModal}>
                        New TU
                    </button>
                </header>

                {loading ? (
                    <p className="tm-message">Loading translation units...</p>
                ) : error ? (
                    <p className="tm-message error">{error}</p>
                ) : tus.length === 0 ? (
                    <p className="tm-message">There are no translation units in this memory.</p>
                ) : (
                    <div className="tu-list">
                        {tus.map((tu) => (
                            <div className="tm-item" key={tu.id}>
                                
                                <div className="tu-content-wrapper">
                                    <div className="tu-text-block">
                                        <span className="tu-label">Source ({idiomaA})</span>
                                        <p className="tu-text">{tu.origen}</p>
                                    </div>
                                    
                                    <div className="tu-text-block">
                                        <span className="tu-label">Target ({idiomaB})</span>
                                        <p className="tu-text">{tu.destino}</p>
                                    </div>
                                </div>

                                <div className="tm-item-actions">
                                    <button 
                                        className="tm-btn tm-btn-secondary" 
                                        onClick={() => openEditModal(tu)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="tm-btn tm-btn-danger" 
                                        onClick={() => setTuToDelete(tu)}
                                    >
                                        Delete
                                    </button>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Crear / Editar TU con indicación de idiomas */}
            {tuModalOpen && (
                <div style={modalStyles.overlay} onClick={closeTuModal}>
                    <div style={modalStyles.editContent} onClick={(e) => e.stopPropagation()}>
                        <h3 style={modalStyles.editTitle}>
                            {isEditing ? 'Edit TU' : 'New TU'}
                        </h3>

                        {message && (
                            <p style={{ color: '#b91c1c', marginBottom: '12px' }}>{message}</p>
                        )}

                        <form onSubmit={handleTuSubmit}>
                            <label style={modalStyles.editField}>
                                <span style={modalStyles.editLabel}>
                                    Origen <span style={{ color: '#0f766e', fontWeight: 'bold' }}>({idiomaA})</span>
                                </span>
                                <textarea
                                    value={origenForm}
                                    onChange={(e) => setOrigenForm(e.target.value)}
                                    style={{ ...modalStyles.editInput, minHeight: '80px', resize: 'vertical' }}
                                    placeholder={`Enter the text in ${idiomaA}...`}
                                    autoFocus
                                />
                            </label>

                            <label style={modalStyles.editField}>
                                <span style={modalStyles.editLabel}>
                                    Destino <span style={{ color: '#0f766e', fontWeight: 'bold' }}>({idiomaB})</span>
                                </span>
                                <textarea
                                    value={destinoForm}
                                    onChange={(e) => setDestinoForm(e.target.value)}
                                    style={{ ...modalStyles.editInput, minHeight: '80px', resize: 'vertical' }}
                                    placeholder={`Enter the text in ${idiomaB}...`}
                                />
                            </label>

                            <div style={modalStyles.buttonContainer}>
                                <button type="button" style={{ ...modalStyles.button, ...modalStyles.cancelBtn }} onClick={closeTuModal} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ ...modalStyles.button, ...modalStyles.confirmBtn }} disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Confirmación Borrar TU */}
            {tuToDelete && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.content}>
                        <h3 style={modalStyles.title}>Delete TU?</h3>
                        <p style={modalStyles.text}>
                            Are you sure you want to permanently delete this translation unit?
                        </p>
                        <div style={modalStyles.buttonContainer}>
                            <button style={{ ...modalStyles.button, ...modalStyles.cancelBtn }} onClick={() => setTuToDelete(null)}>
                                Cancel
                            </button>
                            <button style={{ ...modalStyles.button, ...modalStyles.deleteBtn }} onClick={confirmDelete}>
                                Delete
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
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    content: {
        background: '#ffffff', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '90%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', textAlign: 'center', fontFamily: "'Anonymous Pro', monospace",
    },
    editContent: {
        background: '#ffffff', borderRadius: '18px', padding: '24px', maxWidth: '580px', width: '92%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', textAlign: 'center', fontFamily: "'Anonymous Pro', monospace",
    },
    title: { fontSize: '1.8rem', margin: '0 0 12px 0', color: '#1f2937' },
    editTitle: { fontSize: '1.9rem', margin: '0 0 18px 0', color: '#1f2937' },
    editInput: {
        width: '100%', borderRadius: '12px', border: '1px solid #d1d5db', padding: '12px 14px', fontSize: '1.3rem',
        fontFamily: "'Anonymous Pro', monospace", color: '#1f2937', boxSizing: 'border-box', outline: 'none', marginBottom: '14px',
    },
    editField: { display: 'flex', flexDirection: 'column', textAlign: 'left', marginBottom: '14px' },
    editLabel: { fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '6px' },
    text: { fontSize: '1.2rem', color: '#4b5563', marginBottom: '24px', lineHeight: '1.4' },
    buttonContainer: { display: 'flex', justifyContent: 'center', gap: '12px' },
    button: { padding: '10px 20px', borderRadius: '999px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s ease' },
    cancelBtn: { background: '#ffffff', borderColor: '#9ca3af', color: '#4b5563' },
    confirmBtn: { background: '#0f766e', borderColor: '#0f766e', color: '#ffffff' },
    deleteBtn: { background: '#b91c1c', borderColor: '#b91c1c', color: '#ffffff' }
};