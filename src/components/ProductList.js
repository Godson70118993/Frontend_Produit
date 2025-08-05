// ProductList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProductList = ({ searchTerm }) => {
    const [products, setProducts] = useState([]);

    // Fetch products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Helper function to fetch products
    const fetchProducts = () => {
        axios.get('http://localhost:8001/products/')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                // More detailed error logging for network issues
                if (error.response) {
                    console.error("Data:", error.response.data);
                    console.error("Status:", error.response.status);
                } else if (error.request) {
                    console.error("No response received from backend. Is it running?", error.request);
                } else {
                    console.error("Error setting up request:", error.message);
                }
            });
    };

    const deleteProduct = (id) => {
        // Ensure the ID is passed correctly
        axios.delete(`http://localhost:8001/productsDELETE/${id}`) // Make sure this matches your backend endpoint
            .then(response => {
                // Check if the response indicates success
                // FastAPI's JSONResponse with "message": "Product deleted" will return 200 OK
                console.log("Product deleted successfully:", response.data);
                // Only update the UI if the deletion was confirmed by the backend
                setProducts(products.filter(product => product.id !== id));
            })
            .catch(error => {
                console.error("Error deleting product:", error);
                if (error.response) {
                    console.error("Data:", error.response.data);
                    console.error("Status:", error.response.status);
                } else if (error.request) {
                    console.error("No response from backend for delete. Is it running?", error.request);
                } else {
                    console.error("Error setting up delete request:", error.message);
                }
            });
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm?.toLowerCase() || '') // Added || '' for safer initial render
    );

    return (
        <div style={styles.container}>
            <h2>Product List</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Description</th>
                            <th style={styles.th}>Price</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td style={styles.td}>{product.name}</td>
                                    <td style={styles.td}>{product.description}</td>
                                    <td style={styles.td}>${product.price ? product.price.toFixed(2) : 'N/A'}</td>
                                    <td style={styles.td}>
                                        <div style={styles.actionContainer}>
                                            <Link to={`/edit/${product.id}`} className="button" style={{ ...styles.button, ...styles.editBtn }}>
                                                Edit
                                            </Link>
                                            <button
                                                // Ensure the ID is correctly passed to deleteProduct
                                                onClick={() => deleteProduct(product.id)} className="button"
                                                style={{ ...styles.button, ...styles.deleteBtn }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 10px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        minWidth: '600px'
    },
    th: {
        background: '#333',
        color: '#fff',
        padding: '10px',
        textAlign: 'left',
    },
    td: {
        border: '1px solid #ddd',
        padding: '10px',
    },
    actionContainer: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
    },
    button: {
        padding: '5px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
    },
    editBtn: {
        background: '#FFEB3B',
        color: '#333',
    },
    deleteBtn: {
        background: '#f44336',
        color: '#fff',
    },
};

export default ProductList;