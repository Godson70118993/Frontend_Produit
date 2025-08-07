import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ngrokHeaders = {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
};

const EditProduct = () => {
    const { id } = useParams();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`https://01367a62af2a.ngrok-free.app/products/${id}`, {
            headers: ngrokHeaders
        })
            .then(response => {
                const { name, description, price } = response.data;
                setName(name || '');
                setDescription(description || '');
                setPrice(price || '');
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error fetching product details:", error);
                setIsLoading(false);
            });
    }, [id]);

    const onSubmit = (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        const product = {
            name,
            description,
            price: parseFloat(price)
        };

        axios.put(`https://01367a62af2a.ngrok-free.app/products/${id}`, product, {
            headers: ngrokHeaders
        })
            .then(() => {
                navigate('/');
            })
            .catch(error => {
                console.error("Error updating product:", error);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };
    
    const handleCancel = () => {
        navigate('/');
    };

    if (isLoading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Chargement des données du produit...</p>
            </div>
        );
    }

    return (
        <div style={styles.outerContainer}>
            <div style={styles.formContainer}>
                <h2 style={styles.title}>Modifier le produit</h2>
                <form onSubmit={onSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nom du produit</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={styles.textarea}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Prix (FCFA)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.buttonGroup}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{ ...styles.button, ...styles.cancelButton }}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            style={{ ...styles.button, ...styles.updateButton }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    outerContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        padding: '20px',
    },
    formContainer: {
        maxWidth: '500px',
        width: '100%',
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #ddd',
    },
    title: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '20px',
        fontSize: '24px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px',
        minHeight: '200px'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #333',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    inputGroup: {
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '8px',
        fontWeight: 'bold',
        color: '#555',
    },
    input: {
        padding: '12px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        width: '100%',
        boxSizing: 'border-box',
    },
    textarea: {
        padding: '12px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: '100px',
        resize: 'vertical',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
        justifyContent: 'flex-end',
    },
    button: {
        padding: '12px 20px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        minWidth: '120px',
        fontWeight: 'bold',
    },
    updateButton: {
        background: '#4CAF50',
        color: '#fff',
    },
    // La couleur du bouton Annuler a été mise à jour ici
    cancelButton: {
        background: '#888', // Couleur gris pour correspondre à AddProduct.js
        color: '#fff',
    }
};

export default EditProduct;