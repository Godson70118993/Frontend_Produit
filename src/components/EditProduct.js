// EditProduct.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditProduct = () => {
    const { id } = useParams();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const navigate = useNavigate();

    const ngrokHeaders = {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
    };

    useEffect(() => {
        axios.get(`https://f506191e6049.ngrok-free.app/products/${id}`)
            .then(response => {
                const { name, description, price } = response.data;
                setName(name || '');
                setDescription(description || '');
                setPrice(price || '');
            })
            .catch(error => {
                console.error("Error fetching product details:", error);
            });
    }, [id]);

    const onSubmit = (e) => {
        e.preventDefault();
        const product = {
            name,
            description,
            price: parseFloat(price)
        };

        axios.put(`https://f506191e6049.ngrok-free.app/products/${id}`, product)
            .then(() => {
                navigate('/');
            })
            .catch(error => {
                console.error("Error updating product:", error);
            });
    };

    return (
        <div style={styles.container}>
            <h2>Modifier un produit</h2>
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
                <button type="submit" style={styles.button}>Mettre à jour</button>
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
        background: '#f44336',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
    },
};

export default EditProduct;
