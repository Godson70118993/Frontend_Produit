import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const AddProduct = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const onSubmit = (e) => {
        e.preventDefault();
        
        // Éviter les soumissions multiples
        if (isSubmitting) return;
        
        setIsSubmitting(true);

        const product = { name, description, price: parseFloat(price) };

        axios.post('https://backend-produit-6.onrender.com/products/', product)
            .then(() => navigate('/'))
            .catch(error => {
                console.error("Erreur lors de la création du produit :", error);
                if (error.response) {
                    console.error("Data:", error.response.data);
                    console.error("Status:", error.response.status);
                    console.error("Headers:", error.response.headers);
                } else if (error.request) {
                    console.error("Aucune réponse reçue :", error.request);
                } else {
                    console.error("Erreur de configuration de la requête :", error.message);
                }
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Fonction pour gérer l'annulation et rediriger
    const onCancel = () => {
        navigate('/'); // Redirige vers la liste des produits
    };
    
    return (
        <div style={styles.outerContainer}>
            <div style={styles.formContainer}>
                <h2 style={styles.title}>Ajouter un produit</h2>
                <form onSubmit={onSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nom du produit</label>
                        <input
                            type="text"
                            placeholder="Entrez le nom du produit"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            placeholder="Entrez une description (optionnel)"
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
                            placeholder="Entrez le prix"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    
                    {/* Conteneur pour les deux boutons */}
                    <div style={styles.buttonGroup}>
                        {/* Bouton pour annuler */}
                        <button type="button" onClick={onCancel} style={{ ...styles.button, ...styles.cancelButton }}>
                            Annuler
                        </button>
                        {/* Bouton pour soumettre */}
                        <button type="submit" style={styles.button} disabled={isSubmitting}>
                            {isSubmitting ? 'Ajout en cours...' : 'Ajouter le produit'}
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
        minHeight: 'calc(100vh - 80px)', // Ajuste la hauteur pour le contenu principal
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
        justifyContent: 'space-between',
        gap: '15px', // Espace entre les boutons
        marginTop: '20px',
    },
    button: {
        flex: 1, // Permet aux boutons de prendre la même largeur
        padding: '12px',
        fontSize: '18px',
        background: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    cancelButton: {
        background: '#888', // Une couleur différente pour le bouton Annuler
    },
};

export default AddProduct;