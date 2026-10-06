import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../static/css/tm/tm.css';
import tokenService from '../../services/token.service';

export default function MyTMs() {
    const [tms, setTms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                                        <button className="tm-btn tm-btn-edit">Edit</button>
                                        <button className="tm-btn tm-btn-delete">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}