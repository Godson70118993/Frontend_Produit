import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { productAPI } from '../api/config';


const API_BASE_URL = 'https://backend-produit-12.onrender.com';
const REQUEST_TIMEOUT = 5000; // 5 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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
        padding: '10px',
        paddingTop: '5px', // Espace pour la navbar
    },
    title: {
        fontSize: '28px',
        marginBottom: '30px',
        textAlign: 'center',
        color: '#2c3e50',
        fontWeight: 'bold',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
        paddingTop: '5px', // Espace supplémentaire pour éviter la navbar
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
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
    },
    // Grille responsive pour les produits
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        padding: '0 10px',
        '@media (maxWidth: 768px)': {
            gridTemplateColumns: '1fr',
            gap: '15px',
            padding: '0 5px'
        }
    },
    productCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e0e6ed',
        borderRadius: '15px',
        padding: '0',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        position: 'relative',
        ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }
    },
    productImageContainer: {
        width: '100%',
        height: '200px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #e0e6ed',
        position: 'relative',
        overflow: 'hidden'
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease'
    },
    placeholderImage: {
        fontSize: '48px',
        color: '#95a5a6',
        textAlign: 'center'
    },
    productContent: {
        padding: '20px'
    },
    productHeader: {
        marginBottom: '15px'
    },
    productName: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0 0 8px 0',
        lineHeight: '1.3'
    },
    productPrice: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#27ae60',
        margin: '0',
        display: 'block'
    },
    productDescription: {
        color: '#7f8c8d',
        fontSize: '14px',
        lineHeight: '1.5',
        margin: '15px 0',
        maxHeight: '60px',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    cardActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
        justifyContent: 'flex-end'
    },
    actionButton: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        textDecoration: 'none',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        minWidth: '100px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    editButton: {
        backgroundColor: '#3498db',
        color: '#fff',
        boxShadow: '0 3px 10px rgba(52, 152, 219, 0.3)',
        ':hover': {
            backgroundColor: '#2980b9',
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(52, 152, 219, 0.4)'
        },
        ':active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)'
        }
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        color: '#fff',
        boxShadow: '0 3px 10px rgba(231, 76, 60, 0.3)',
        ':hover': {
            backgroundColor: '#c0392b',
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(231, 76, 60, 0.4)'
        },
        ':active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)'
        }
    },
    // Version responsive pour mobile
    '@media (maxWidth: 768px)': {
        cardActions: {
            flexDirection: 'column',
            gap: '8px'
        },
        actionButton: {
            width: '100%',
            padding: '12px 20px',
            fontSize: '16px'
        },
        editButton: {
            width: '100%'
        }
    },
    noProducts: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#7f8c8d',
        fontSize: '18px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '15px',
        margin: '20px 0'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(5px)'
    },
    modal: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '20px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        animation: 'modalSlideIn 0.3s ease'
    },
    modalTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50',
        fontSize: '22px',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    modalMessage: {
        margin: '0 0 30px 0',
        color: '#7f8c8d',
        fontSize: '16px',
        textAlign: 'center',
        lineHeight: '1.5'
    },
    modalActions: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'center'
    },
    modalButton: {
        padding: '12px 30px',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        minWidth: '100px',
        transition: 'all 0.3s ease'
    },
    confirmButton: {
        backgroundColor: '#e74c3c',
        color: '#fff',
        ':hover': {
            backgroundColor: '#c0392b',
            transform: 'translateY(-2px)'
        }
    },
    cancelButton: {
        backgroundColor: '#95a5a6',
        color: '#fff',
        ':hover': {
            backgroundColor: '#7f8c8d',
            transform: 'translateY(-2px)'
        }
    },
    retryButton: {
        marginLeft: '15px',
        padding: '8px 16px',
        backgroundColor: '#3498db',
        color: '#fff',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: '#2980b9',
            transform: 'translateY(-1px)'
        }
    },
    errorMessage: {
        color: '#e74c3c',
        textAlign: 'center',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        padding: '15px',
        borderRadius: '10px',
        margin: '20px 0',
        border: '1px solid rgba(231, 76, 60, 0.2)'
    }
};

// Ajout des animations CSS
const cssAnimations = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-50px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.product-card:hover .product-image {
    transform: scale(1.05);
}

.action-button {
    position: relative;
    overflow: hidden;
}

.action-button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255,255,255,0.3);
    border-radius: 50%;
    transition: width 0.3s, height 0.3s;
    transform: translate(-50%, -50%);
}

.action-button:hover::before {
    width: 300px;
    height: 300px;
}

// Version responsive pour mobile
'@media (maxWidth: 768px)': {
    cardActions: {
        flexDirection: 'column',
        gap: '8px'
    },
    actionButton: {
        width: '100% !important',  // Force la largeur à 100% pour tous les boutons
        padding: '12px 20px',
        fontSize: '16px',
        display: 'block' // Ajout de cette ligne pour s'assurer du comportement en bloc
    },
    editButton: {
        width: '100% !important', // Double assurance pour le bouton Modifier
        margin: '0 !important'    // Supprime les marges potentielles
    },
    deleteButton: {
        width: '100% !important'  // Double assurance pour le bouton Supprimer
    }
}

    '@media (maxWidth: 768px)': {
        outerContainer: {
            padding: '10px',
        },
        formContainer: {
            padding: '20px',
        },
        title: {
            fontSize: '24px',
        },
        buttonGroup: {
            flexDirection: 'column',
        },
        button: {
            width: '100%',
        },
        imagePreview: {
            height: '200px',
        },
        imageOverlay: {
            flexDirection: 'column',
            gap: '10px',
        },
        uploadPlaceholder: {
            padding: '30px 15px',
        }
    },
      
}
`;

const ProductList = ({ searchTerm }) => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        // Injecter les styles CSS
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = cssAnimations;
        document.head.appendChild(styleSheet);

        fetchProducts();

        return () => {
            // Nettoyer les styles injectés
            document.head.removeChild(styleSheet);
        };
    }, []);

    const fetchProducts = async (retryAttempt = 0) => {
        setIsLoading(true);
        setError('');
        
        try {
            const response = await axios.get(`${API_BASE_URL}/products/`, {
                timeout: REQUEST_TIMEOUT
            });
            
            if (Array.isArray(response.data)) {
                setProducts(response.data);
            } else if (Array.isArray(response.data.products)) {
                setProducts(response.data.products);
            } else {
                throw new Error("Format inattendu des données reçues.");
            }
            setRetryCount(0);
        } catch (error) {
            console.error("Erreur lors de la récupération des produits:", error);
            
            if (error.code === 'ECONNABORTED') {
                setError("Le serveur met trop de temps à répondre.");
            } else if (error.code === 'ERR_NETWORK') {
                setError("Problème de connexion. Vérifiez votre réseau.");
                
                if (retryAttempt < MAX_RETRIES) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        fetchProducts(retryAttempt + 1);
                    }, RETRY_DELAY * (retryAttempt + 1));
                    return;
                }
            } else {
                setError("Une erreur est survenue lors du chargement des produits.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        
        setIsDeleting(true);
        try {
            await axios.delete(`${API_BASE_URL}/products/${productToDelete.id}`, {
                timeout: REQUEST_TIMEOUT
            });
            setProducts(prevProducts => 
                prevProducts.filter(product => product.id !== productToDelete.id)
            );
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch (error) {
            console.error("Erreur lors de la suppression du produit:", error);
            setError(
                error.code === 'ERR_NETWORK' 
                    ? "Erreur réseau lors de la suppression. Veuillez réessayer."
                    : "Échec de la suppression du produit."
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
    };

    const filteredProducts = Array.isArray(products)
        ? products.filter(product =>
            product.name?.toLowerCase().includes(searchTerm?.toLowerCase() || ''))
        : [];

    if (isLoading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Chargement des produits...{retryCount > 0 && ` (Essai ${retryCount}/${MAX_RETRIES})`}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Liste des produits</h2>
            
            {error && (
                <div style={styles.errorMessage}>
                    {error}
                    <button 
                        onClick={() => fetchProducts()} 
                        style={styles.retryButton}
                        className="action-button"
                    >
                        Réessayer
                    </button>
                </div>
            )}

            {/* Grille de produits responsive */}
            <div style={styles.productsGrid} className="products-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div key={product.id} style={styles.productCard} className="product-card">
                            {/* Section photo du produit */}
                            <div style={styles.productImageContainer}>
                                {product.image ? (
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        style={styles.productImage}
                                        className="product-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div style={styles.placeholderImage}>
                                    📷
                                </div>
                            </div>

                            {/* Contenu du produit */}
                            <div style={styles.productContent}>
                                <div style={styles.productHeader}>
                                    <h3 style={styles.productName}>{product.name}</h3>
                                    <span style={styles.productPrice}>
                                        {product.price ? `${product.price.toFixed(0)} FCFA` : 'Prix non défini'}
                                    </span>
                                </div>
                                
                                <p style={styles.productDescription}>
                                    {product.description || 'Aucune description disponible'}
                                </p>

                                {/* Actions */}
                                <div style={styles.cardActions} className="card-actions">
                                    <Link 
                                        to={`/edit/${product.id}`} 
                                        style={{...styles.actionButton, ...styles.editButton}}
                                        className="action-button"
                                    >
                                        ✏️ Modifier
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteClick(product)}
                                        style={{...styles.actionButton, ...styles.deleteButton}}
                                        className="action-button"
                                    >
                                        🗑️ Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    !error && (
                        <div style={styles.noProducts}>
                            <p>😕 Aucun produit trouvé.</p>
                            <p>Commencez par ajouter votre premier produit !</p>
                        </div>
                    )
                )}
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>⚠️ Confirmation de suppression</h3>
                        <p style={styles.modalMessage}>
                            Êtes-vous sûr de vouloir supprimer le produit <strong>"{productToDelete?.name}"</strong> ?
                            <br />Cette action est irréversible.
                        </p>
                        <div style={styles.modalActions}>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                style={{...styles.modalButton, ...styles.confirmButton}}
                                className="action-button"
                            >
                                {isDeleting ? '⏳ Suppression...' : '✅ Oui, supprimer'}
                            </button>
                            <button
                                onClick={cancelDelete}
                                disabled={isDeleting}
                                style={{...styles.modalButton, ...styles.cancelButton}}
                                className="action-button"
                            >
                                ❌ Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;