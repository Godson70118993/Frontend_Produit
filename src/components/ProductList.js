// ProductList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProductList = ({ searchTerm }) => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        axios.get('hhttps://897fc7cb9e96.ngrok-free.app/')
            .then(response => {
                console.log("Réponse brute :", response.data);

                // Si c'est un tableau, on le garde, sinon on essaye d'en extraire un
                if (Array.isArray(response.data)) {
                    setProducts(response.data);
                } else if (Array.isArray(response.data.products)) {
                    setProducts(response.data.products);
                } else {
                    setError("Format inattendu des données reçues.");
                    console.error("Format inattendu :", response.data);
                    setProducts([]); // éviter le crash
                }
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des produits:", error);
                setError("Erreur réseau ou serveur. Impossible de charger les produits.");
                if (error.response) {
                    console.error("Data:", error.response.data);
                    console.error("Status:", error.response.status);
                } else if (error.request) {
                    console.error("Pas de réponse du backend:", error.request);
                } else {
                    console.error("Erreur de configuration de la requête:", error.message);
                }
            });
    };

    const deleteProduct = (id) => {
        axios.delete(`https://897fc7cb9e96.ngrok-free.app/productsDELETE/${id}`)
            .then(response => {
                console.log("Produit supprimé avec succès:", response.data);
                setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
            })
            .catch(error => {
                console.error("Erreur lors de la suppression du produit:", error);
                if (error.response) {
                    console.error("Data:", error.response.data);
                    console.error("Status:", error.response.status);
                } else if (error.request) {
                    console.error("Pas de réponse du backend pour delete:", error.request);
                } else {
                    console.error("Erreur de configuration de la requête delete:", error.message);
                }
            });
    };

    const filteredProducts = Array.isArray(products)
        ? products.filter(product =>
            product.name?.toLowerCase().includes(searchTerm?.toLowerCase() || '')
        )
        : [];

    return (
        <div style={styles.container}>
            <h2>Liste des produits</h2>

            {error && (
                <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Nom</th>
                            <th style={styles.th}>Description</th>
                            <th style={styles.th}>Prix</th>
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
                                                Modifier
                                            </Link>
                                            <button
                                                onClick={() => deleteProduct(product.id)}
                                                className="button"
                                                style={{ ...styles.button, ...styles.deleteBtn }}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                    Aucun produit trouvé.
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
