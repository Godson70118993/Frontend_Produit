import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, formatApiError } from '../api/config'; // ← UTILISER LA MÊME API QUE AddProduct et EditProduct

const ProductList = ({ searchTerm }) => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [serverStatus, setServerStatus] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        setError('');
        setServerStatus('Chargement des produits...');
        
        try {
            const data = await productAPI.getAll();
            setProducts(Array.isArray(data) ? data : []);
            setServerStatus('');
        } catch (error) {
            console.error("Erreur lors de la récupération des produits:", error);
            setError(formatApiError(error));
            setServerStatus('');
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
        setError('');
        setServerStatus('Suppression en cours...');
        
        try {
            await productAPI.delete(productToDelete.id);
            setProducts(prevProducts => 
                prevProducts.filter(product => product.id !== productToDelete.id)
            );
            setShowDeleteModal(false);
            setProductToDelete(null);
            setServerStatus('Produit supprimé avec succès !');
            
            // Effacer le message de succès après 3 secondes
            setTimeout(() => setServerStatus(''), 3000);
        } catch (error) {
            console.error("Erreur lors de la suppression du produit:", error);
            setError(formatApiError(error));
            setServerStatus('');
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
    };

    // Fonction pour construire l'URL complète de l'image
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        // Si c'est déjà une URL complète, l'utiliser directement
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // Si le chemin commence par '/', l'ajouter à l'URL de base
        if (imagePath.startsWith('/')) {
            return `https://backend-produit-12.onrender.com${imagePath}`;
        }
        
        // Sinon, construire l'URL complète
        return `https://backend-produit-12.onrender.com/${imagePath}`;
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
                    <p style={styles.loadingText}>⏳ Chargement des produits...</p>
                    {serverStatus && <p style={styles.statusText}>{serverStatus}</p>}
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>📦 Liste des produits</h2>
            
            {/* Messages d'état */}
            {error && (
                <div style={styles.errorMessage}>
                    {error}
                    <button 
                        onClick={fetchProducts} 
                        style={styles.retryButton}
                        className="action-button"
                    >
                        🔄 Réessayer
                    </button>
                </div>
            )}

            {serverStatus && (
                <div style={styles.statusMessage}>
                    {serverStatus}
                </div>
            )}

            {/* Grille de produits responsive */}
            <div style={styles.productsGrid} className="products-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => {
                        const imageUrl = getImageUrl(product.image);
                        
                        return (
                            <div key={product.id} style={styles.productCard} className="product-card">
                                {/* Section photo du produit */}
                                <div style={styles.productImageContainer}>
                                    {imageUrl ? (
                                        <img 
                                            src={imageUrl} 
                                            alt={product.name}
                                            style={styles.productImage}
                                            className="product-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        style={{
                                            ...styles.placeholderImage,
                                            display: imageUrl ? 'none' : 'flex'
                                        }}
                                    >
                                        📷
                                    </div>
                                </div>

                                {/* Contenu du produit */}
                                <div style={styles.productContent}>
                                    <div style={styles.productHeader}>
                                        <h3 style={styles.productName}>{product.name}</h3>
                                        <span style={styles.productPrice}>
                                            {product.price ? `${parseFloat(product.price).toFixed(0)} FCFA` : 'Prix non défini'}
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
                                            className="action-button edit-button"
                                        >
                                            ✏️ Modifier
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteClick(product)}
                                            style={{...styles.actionButton, ...styles.deleteButton}}
                                            className="action-button delete-button"
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    !error && (
                        <div style={styles.noProducts}>
                            <div style={styles.noProductsIcon}>📦</div>
                            <h3>Aucun produit trouvé</h3>
                            <p>Commencez par ajouter votre premier produit !</p>
                            <Link to="/add" style={styles.addFirstProductButton}>
                                ➕ Ajouter un produit
                            </Link>
                        </div>
                    )
                )}
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div style={styles.modalOverlay} onClick={cancelDelete}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>⚠️ Confirmation de suppression</h3>
                        <p style={styles.modalMessage}>
                            Êtes-vous sûr de vouloir supprimer le produit <br />
                            <strong>"{productToDelete?.name}"</strong> ?
                            <br /><br />
                            <em>Cette action est irréversible.</em>
                        </p>
                        <div style={styles.modalActions}>
                            <button
                                onClick={cancelDelete}
                                disabled={isDeleting}
                                style={{...styles.modalButton, ...styles.cancelButton}}
                                className="action-button"
                            >
                                ❌ Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                style={{
                                    ...styles.modalButton, 
                                    ...styles.confirmButton,
                                    ...(isDeleting ? styles.confirmButtonDisabled : {})
                                }}
                                className="action-button"
                            >
                                {isDeleting ? '⏳ Suppression...' : '🗑️ Supprimer'}
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        paddingTop: '10px', // Espace pour la navbar
        minHeight: '100vh',
    },
    title: {
        fontSize: '28px',
        marginBottom: '30px',
        textAlign: 'center',
        color: '#2c3e50',
        fontWeight: 'bold',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 20px',
        minHeight: '300px',
        textAlign: 'center',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px',
    },
    loadingText: {
        color: '#2c3e50',
        fontSize: '16px',
        margin: '0 0 10px 0',
        fontWeight: 'bold',
    },
    statusText: {
        color: '#7f8c8d',
        fontSize: '14px',
        margin: '0',
    },
    errorMessage: {
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        color: '#e74c3c',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid rgba(231, 76, 60, 0.3)',
        fontSize: '14px',
        lineHeight: '1.5',
        textAlign: 'center',
    },
    statusMessage: {
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        color: '#3498db',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid rgba(52, 152, 219, 0.3)',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
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
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        padding: '0',
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
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
    },
    placeholderImage: {
        fontSize: '48px',
        color: '#95a5a6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f8f9fa',
    },
    productContent: {
        padding: '20px',
    },
    productHeader: {
        marginBottom: '15px',
    },
    productName: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0 0 8px 0',
        lineHeight: '1.3',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    productPrice: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#27ae60',
        margin: '0',
        display: 'block',
    },
    productDescription: {
        color: '#7f8c8d',
        fontSize: '14px',
        lineHeight: '1.5',
        margin: '15px 0',
        maxHeight: '60px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
    },
    cardActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
        justifyContent: 'flex-end',
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
    },
    editButton: {
        backgroundColor: '#3498db',
        color: '#fff',
        boxShadow: '0 3px 10px rgba(52, 152, 219, 0.3)',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        color: '#fff',
        boxShadow: '0 3px 10px rgba(231, 76, 60, 0.3)',
    },
    noProducts: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#7f8c8d',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '15px',
        margin: '20px 0',
        gridColumn: '1 / -1', // Prend toute la largeur de la grille
    },
    noProductsIcon: {
        fontSize: '64px',
        marginBottom: '20px',
        opacity: 0.7,
    },
    addFirstProductButton: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '15px 30px',
        backgroundColor: '#27ae60',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '25px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
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
        backdropFilter: 'blur(5px)',
    },
    modal: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '20px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        animation: 'modalSlideIn 0.3s ease',
    },
    modalTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50',
        fontSize: '22px',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    modalMessage: {
        margin: '0 0 30px 0',
        color: '#7f8c8d',
        fontSize: '16px',
        textAlign: 'center',
        lineHeight: '1.5',
    },
    modalActions: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
    },
    modalButton: {
        padding: '12px 30px',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        minWidth: '120px',
        transition: 'all 0.3s ease',
    },
    confirmButton: {
        backgroundColor: '#e74c3c',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
    },
    confirmButtonDisabled: {
        backgroundColor: '#95a5a6',
        cursor: 'not-allowed',
        boxShadow: 'none',
    },
    cancelButton: {
        backgroundColor: '#95a5a6',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(149, 165, 166, 0.3)',
    },

    
};

// Animation CSS
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

.edit-button:hover {
    background-color: #2980b9 !important;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4) !important;
}

.delete-button:hover {
    background-color: #c0392b !important;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4) !important;
}

.action-button:hover {
    transform: translateY(-2px);
}

/* Responsive design */
@media (maxWidth: 768px) {
    .products-grid {
        grid-template-columns: 1fr !important;
        gap: 15px !important;
        padding: 0 5px !important;
    }
    
    .card-actions {
        flex-direction: column !important;
        gap: 8px !important;
    }
    
    .action-button {
        width: 100% !important;
        padding: 12px 20px !important;
        font-size: 16px !important;
        display: block !important;
        margin: 0 !important;
        box-sizing: border-box !important;
    }
        
}
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
`;


// Injection des styles dans le DOM
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = cssAnimations;
    if (!document.head.querySelector('[data-productlist-styles]')) {
        styleSheet.setAttribute('data-productlist-styles', 'true');
        document.head.appendChild(styleSheet);
    }
}

export default ProductList;