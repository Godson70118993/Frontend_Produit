// ProductList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProductList = ({ searchTerm }) => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        setIsLoading(true);
        axios.get('https://backend-produit-6.onrender.com/products/', {
            headers: ngrokHeaders
        })
            .then(response => {
                if (Array.isArray(response.data)) {
                    setProducts(response.data);
                    setError('');
                } else if (Array.isArray(response.data.products)) {
                    setProducts(response.data.products);
                    setError('');
                } else {
                    setError("Format inattendu des données reçues.");
                    setProducts([]);
                }
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des produits:", error);
                setError("Erreur réseau ou serveur. Impossible de charger les produits.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        axios.delete(`https://backend-produit-6.onrender.com/products/${productToDelete.id}`, {
            headers: ngrokHeaders
        })
            .then(() => {
                setProducts(prevProducts => prevProducts.filter(product => product.id !== productToDelete.id));
                setShowDeleteModal(false);
                setProductToDelete(null);
            })
            .catch(error => {
                console.error("Erreur lors de la suppression du produit:", error);
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
    };

    const filteredProducts = Array.isArray(products)
        ? products.filter(product =>
            product.name?.toLowerCase().includes(searchTerm?.toLowerCase() || '')
        )
        : [];

    if (isLoading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Chargement des produits...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={{ ...styles.title, color: '#000' }}>Liste des produits</h2>
            {error && (
                <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
            )}

            {/* Version mobile - Cards */}
            <div style={styles.mobileView}>
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div key={product.id} style={styles.productCard}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.productName}>{product.name}</h3>
                                <span style={styles.productPrice}>
                                    {product.price ? `${product.price.toFixed(0)} FCFA` : 'N/A'}
                                </span>
                            </div>
                            <p style={styles.productDescription}>
                                {product.description || 'Aucune description'}
                            </p>
                            <div style={styles.cardActions}>
                                <Link 
                                    to={`/edit/${product.id}`} 
                                    style={{ ...styles.mobileButton, ...styles.editBtnMobile }}
                                >
                                    Modifier
                                </Link>
                                <button
                                    onClick={() => handleDeleteClick(product)}
                                    style={{ ...styles.mobileButton, ...styles.deleteBtnMobile }}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={styles.noProducts}>
                        <p>Aucun produit trouvé.</p>
                    </div>
                )}
            </div>

            {/* Version desktop - Table */}
            <div style={styles.desktopView}>
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
                                    <td style={styles.td}>
                                        {product.price ? `${product.price.toFixed(0)} FCFA` : 'N/A'}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actionContainer}>
                                            <Link 
                                                to={`/edit/${product.id}`} 
                                                style={{ ...styles.button, ...styles.editBtn }}
                                            >
                                                Modifier
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(product)}
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

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>Confirmation de suppression</h3>
                        <p style={styles.modalMessage}>
                            Êtes-vous sûr de supprimer le produit <strong>"{productToDelete?.name}"</strong> ?
                        </p>
                        <div style={styles.modalActions}>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                style={{ ...styles.modalButton, ...styles.confirmButton }}
                            >
                                {isDeleting ? 'Suppression...' : 'Oui'}
                            </button>
                            <button
                                onClick={cancelDelete}
                                disabled={isDeleting}
                                style={{ ...styles.modalButton, ...styles.cancelButton }}
                            >
                                Non
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundImage: 'url("")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '10px'
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
        textAlign: 'center',
        color: '#333'
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
    mobileView: {
        display: 'block',
        '@media (min-width: 768px)': {
            display: 'none'
        }
    },
    desktopView: {
        display: 'none',
        '@media (min-width: 768px)': {
            display: 'block'
        }
    },
    productCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid #ddd',
        borderRadius: '8px',
        margin: '10px 0',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px'
    },
    productName: {
        fontSize: '18px',
        margin: '0',
        color: '#333',
        flex: 1,
        paddingRight: '10px'
    },
    productPrice: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#4CAF50',
        whiteSpace: 'nowrap'
    },
    productDescription: {
        color: '#666',
        margin: '10px 0',
        fontSize: '14px',
        lineHeight: '1.4'
    },
    cardActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '15px'
    },
    mobileButton: {
        flex: 1,
        padding: '10px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        textDecoration: 'none',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 'bold'
    },
    editBtnMobile: {
        backgroundColor: '#FFEB3B',
        color: '#333'
    },
    deleteBtnMobile: {
        backgroundColor: '#f44336',
        color: '#fff'
    },
    noProducts: {
        textAlign: 'center',
        padding: '40px',
        color: '#666'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    th: {
        background: '#333',
        color: '#fff',
        padding: '12px',
        textAlign: 'left',
        fontSize: '16px'
    },
    td: {
        border: '1px solid #ddd',
        padding: '12px',
        fontSize: '14px'
    },
    actionContainer: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
    },
    button: {
        padding: '6px 12px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textDecoration: 'none',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    editBtn: {
        background: '#FFEB3B',
        color: '#333'
    },
    deleteBtn: {
        background: '#f44336',
        color: '#fff'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    },
    modal: {
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    },
    modalTitle: {
        margin: '0 0 15px 0',
        color: '#333',
        fontSize: '20px',
        textAlign: 'center'
    },
    modalMessage: {
        margin: '0 0 25px 0',
        color: '#666',
        fontSize: '16px',
        textAlign: 'center',
        lineHeight: '1.4'
    },
    modalActions: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'center'
    },
    modalButton: {
        padding: '10px 25px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        minWidth: '80px'
    },
    confirmButton: {
        backgroundColor: '#f44336',
        color: '#fff'
    },
    cancelButton: {
        backgroundColor: '#757575',
        color: '#fff'
    }
};

export default ProductList;