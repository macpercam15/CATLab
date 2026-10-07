import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../static/css/tm/tm.css';
import tokenService from '../../services/token.service';

export default function MyTMs() {
    const [tms, setTms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para la edición y eliminación
    const [tmToDelete, setTmToDelete] = useState(null);
    const [tmToEdit, setTmToEdit] = useState(null);
    const [editTmName, setEditTmName] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [visible, setVisible] = useState(false);

    const jwt = tokenService.getLocalAccessToken();
    const currentUser = tokenService.getUser();
    const navigate = useNavigate();

    // Importante: 'User' y 'Estudiante' son entidades distintas.
    // El endpoint /api/tm/student/{studentId} requiere el ID de Estudiante.
    const studentId = currentUser?.student?.id || currentUser?.estudiante?.id || currentUser?.id;

    useEffect(() => {
        if (!studentId || !jwt) {
            setError('Usuario no autenticado o no se encontró el estudiante asociado.');
            setLoading(false);
            return;
        }

        fetch(`/api/tm/student/${studentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener las memorias de traducción.');
                }
                return response.json();
            })
            .then((data) => {
                setTms(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching TMs:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [studentId, jwt]);

    // Lógica para el modal de edición
    const openEditModal = (tm) => {
        setTmToEdit(tm);
        setEditTmName(tm.name || '');
        setMessage(null);
        setVisible(false);
    };

    const closeEditModal = () => {
        setTmToEdit(null);
        setEditTmName('');
        setEditSubmitting(false);
        setMessage(null);
        setVisible(false);
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();

        if (!tmToEdit) return;

        const nextName = editTmName.trim();
        if (!nextName) {
            setMessage('Introduce un nombre para la memoria de traducción.');
            setVisible(true);
            return;
        }

        try {
            setEditSubmitting(true);

            const response = await fetch(`/api/tm/edit/${tmToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: nextName }),
            });

            if (response.ok) {
                const updatedTm = await response.json();
                setTms((prevTms) =>
                    prevTms.map((t) => (t.id === updatedTm.id ? updatedTm : t))
                );
                closeEditModal();
            } else {
                const text = await response.text();
                setMessage(text || 'Error al actualizar la TM.');
                setVisible(true);
            }
        } catch (error) {
            setMessage('Error al conectar con el servidor.');
            setVisible(true);
        } finally {
            setEditSubmitting(false);
        }
    };

    // Lógica para confirmar la eliminación
    const confirmDelete = async () => {
        if (!tmToDelete) return;

        try {
            const response = await fetch(`/api/tm/delete/${tmToDelete.id}`, {
                method: 'POST', // Siguiendo el @PostMapping de tu controlador
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                },
            });

            if (response.ok) {
                setTms((prevTms) =>
                    prevTms.filter((t) => t.id !== tmToDelete.id)
                );
                setMessage(null);
                setVisible(false);
            } else {
                const text = await response.text();
                setMessage(text || 'Error al eliminar la TM.');
                setVisible(true);
            }
        } catch (error) {
            setMessage('Error al conectar con el servidor.');
            setVisible(true);
        } finally {
            setTmToDelete(null);
        }
    };

    return (
        <div className="tm-page">
            <div className="tm-shell">
                <h1 className="tm-title">My TMs</h1>

                <div className="tm-toolbar">
                    <div className="tm-search">
                        <input type="text" placeholder="Search..." aria-label="Search TMs" />
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <line x1="16.5" y1="16.5" x2="21" y2="21" />
                        </svg>
                    </div>

                    <button className="tm-new-btn" onClick={() => navigate('/student/tms/new')}>
                        New TM
                    </button>
                </div>
                
                {visible && message && !tmToEdit && (
                    <p style={{ color: '#b91c1c', textAlign: 'center', marginBottom: '16px' }}>{message}</p>
                )}

                <div className="tm-list">
                    <div className="tm-row tm-row-head">
                        <span>Name</span>
                        <span>Languages</span>
                        <span>Actions</span>
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '20px' }}>Cargando memorias...</p>
                    ) : error ? (
                        <p style={{ textAlign: 'center', padding: '20px', color: '#b91c1c' }}>{error}</p>
                    ) : tms.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '20px' }}>No hay memorias de traducción disponibles.</p>
                    ) : (
                        <div className="tm-rows">
                            {tms.map((tm) => (
                                <div className="tm-row tm-row-item" key={tm.id}>
                                    <span className="tm-name">{tm.name}</span>
                                    <span className="tm-langs">
                                        {`${tm.idiomaA?.codigo || '—'}-${tm.idiomaB?.codigo || '—'}`}
                                    </span>
                                    <div className="tm-actions">
                                        <button 
                                            className="tm-btn tm-btn-edit" 
                                            onClick={() => openEditModal(tm)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="tm-btn tm-btn-delete" 
                                            onClick={() => setTmToDelete(tm)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para Editar TM */}
            {tmToEdit && (
                <div style={modalStyles.overlay} onClick={closeEditModal}>
                    <div style={modalStyles.editContent} onClick={(e) => e.stopPropagation()}>
                        <h3 style={modalStyles.editTitle}>Edit Translation Memory</h3>

                        {visible && message && (
                            <p style={{ color: '#b91c1c', marginBottom: '12px' }}>{message}</p>
                        )}

                        <form onSubmit={handleEditSubmit}>
                            <label style={modalStyles.editField}>
                                <span style={modalStyles.editLabel}>Name</span>
                                <input
                                    type="text"
                                    value={editTmName}
                                    onChange={(e) => setEditTmName(e.target.value)}
                                    style={modalStyles.editInput}
                                    placeholder="TM name"
                                    autoFocus
                                />
                            </label>

                            <div style={modalStyles.buttonContainer}>
                                <button
                                    style={{ ...modalStyles.button, ...modalStyles.cancelBtn }}
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={editSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    style={{ ...modalStyles.button, ...modalStyles.confirmBtn }}
                                    type="submit"
                                    disabled={editSubmitting}
                                >
                                    {editSubmitting ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Confirmar Eliminación */}
            {tmToDelete && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.content}>
                        <h3 style={modalStyles.title}>Delete TM?</h3>
                        <p style={modalStyles.text}>
                            Are you sure you want to permanently delete the TM <strong>"{tmToDelete.name}"</strong>? 
                            This action cannot be undone.
                        </p>
                        <div style={modalStyles.buttonContainer}>
                            <button 
                                style={{ ...modalStyles.button, ...modalStyles.cancelBtn }}
                                onClick={() => setTmToDelete(null)}
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
        </div>
    );
}

// Estilos de los modales (Copiados de MyProjects.js para mantener consistencia)
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
    editField: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        marginBottom: '14px',
    },
    editLabel: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '6px',
    },
    text: {
        fontSize: '1.2rem',
        color: '#4b5563',
        marginBottom: '24px',
        lineHeight: '1.4',
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
    }
};