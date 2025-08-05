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

    useEffect(() => {
        axios.get(`http://localhost:8001/products/${id}`)
            .then(response => {
                const { name, description, price } = response.data;
                setName(name || ''); // Ensure default to empty string if null/undefined
                setDescription(description || '');
                setPrice(price || ''); // Ensure default to empty string if null/undefined
            })
            .catch(error => {
                console.error("Error fetching product details:", error);
                if (error.response) {
                    console.error("Data:", error.response.data);
                    console.error("Status:", error.response.status);
                } else if (error.request) {
                    console.error("No response from backend for fetch product. Is it running?", error.request);
                } else {
                    console.error("Error setting up fetch request:", error.message);
                }
            });
    }, [id]);

    const onSubmit = (e) => {
        e.preventDefault();
        const product = {
            name,
            description,
            price: parseFloat(price) // Ensure price is a number
        };

        // CORRECTED: Ensure the PUT endpoint matches your FastAPI backend!
        axios.put(`http://localhost:8001/productsPUT/${id}`, product)
            .then(() => {
                console.log("Product updated successfully!");
                navigate('/'); // Navigate back to product list on success
            })
            .catch(error => {
                console.error("Error updating product:", error);
                if (error.response) {
                    console.error("Data:", error.response.data);
                    console.error("Status:", error.response.status);
                    console.error("Headers:", error.response.headers);
                } else if (error.request) {
                    console.error("No response from backend for update. Is it running?", error.request);
                } else {
                    console.error("Error setting up update request:", error.message);
                }
            });
    };

    return (
        <div style={styles.container}>
            <h2>Edit Product</h2>
            <form onSubmit={onSubmit} style={styles.form}>
                <input
                    type="text"
                    placeholder="Name"
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
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Update</button>
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