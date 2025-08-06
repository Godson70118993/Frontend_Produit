// AddProduct.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ngrokHeaders = {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
};

const AddProduct = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const navigate = useNavigate();

    const onSubmit = (e) => {
        e.preventDefault();

        const product = { name, description, price: parseFloat(price) };

        axios.post('https://f506191e6049.ngrok-free.app/products/', product)
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
            });
    };

    return (
        <div style={styles.container}>
            <h2>Ajouter un produit</h2>
            <form onSubmit={onSubmit} style={styles.form}>
                <input
                    type="text"
                    placeholder="Nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="number"
                    step="0.01"
                    placeholder="Prix"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Ajouter</button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '500px',
        margin: '0 auto',
        background: '#f9f9f9',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        marginBottom: '15px',
        padding: '10px',
        fontSize: '16px',
    },
    button: {
        padding: '10px',
        background: '#4CAF50',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
    },
};

export default AddProduct;
