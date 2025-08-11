import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditProduct = () => {
    const { id } = useParams();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [currentImage, setCurrentImage] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [serverStatus, setServerStatus] = useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // URL de base de l'API
    const API_BASE_URL = 'https://backend-produit-12.onrender.com';

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setServerStatus('Chargement des données...');
                const response = await fetch(`${API_BASE_URL}/products/${id}`);
                
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`);
                }
                
                const productData = await response.json();
                const { name, description, price, image } = productData;
                
                setName(name || '');
                setDescription(description || '');
                setPrice(price?.toString() || '');
                setCurrentImage(image || null);
                setImagePreview(image || null);
                setServerStatus('');
            } catch (error) {
                console.error("Erreur lors de la récupération du produit:", error);
                setError('Erreur lors du chargement des données du produit.');
                setServerStatus('');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    // Gestion de l'upload d'une nouvelle image
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Vérification du type de fichier
            if (!file.type.startsWith('image/')) {
                setError('Veuillez sélectionner un fichier image valide.');
                return;
            }
            
            // Vérification de la taille (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('La taille de l\'image ne doit pas dépasser 5MB.');
                return;
            }

            setNewImage(file);
            setError('');
            
            // Créer un aperçu de la nouvelle image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Déclencher la sélection de fichier
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Supprimer l'image (revenir à l'image originale ou aucune image)
    const removeImage = () => {
        setNewImage(null);
        setImagePreview(currentImage);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Supprimer définitivement l'image du produit
    const removeCurrentImage = () => {
        setCurrentImage(null);
        setNewImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;

        // Validation
        if (!name.trim()) {
            setError('Le nom du produit est obligatoire.');
            return;
        }

        if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            setError('Veuillez entrer un prix valide.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setServerStatus('Mise à jour en cours...');

        try {
            // ✅ CORRECTION : Utiliser FormData pour la mise à jour avec image
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('description', description.trim());
            formData.append('price', parseFloat(price));
            
            // Si une nouvelle image a été sélectionnée
            if (newImage) {
                formData.append('image', newImage);
            }
            // Si l'utilisateur a supprimé l'image actuelle
            else if (!imagePreview && currentImage) {
                formData.append('removeImage', 'true');
            }

            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                body: formData, // Ne pas définir Content-Type, le navigateur le fait automatiquement
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
            }

            const result = await response.json();
            setServerStatus('Produit mis à jour avec succès !');
            console.log('Produit mis à jour:', result);
            
            // Redirection après succès
            setTimeout(() => {
                navigate('/');
            }, 1000);
            
        } catch (error) {
            console.error("Erreur lors de la mise à jour du produit:", error);
            
            // Gestion spécifique des erreurs
            if (error.name === 'TypeError') {
                setError('🌐 Erreur réseau: Impossible de contacter le serveur.');
            } else if (error.message.includes('413')) {
                setError('📸 Image trop volumineuse: Réduisez la taille de votre image.');
            } else if (error.message.includes('400')) {
                setError(`❌ Données invalides: ${error.message}`);
            } else {
                setError(`❌ Erreur: ${error.message || 'Une erreur inattendue est survenue.'}`);
            }
            
            setServerStatus('');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCancel = () => {
        navigate('/');
    };

    if (isLoading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>⏳ Chargement des données du produit...</p>
            </div>
        );
    }

    return (
        <div style={styles.outerContainer} className="outer-container">
            <div style={styles.formContainer} className="form-container">
                <h2 style={styles.title} className="form-title">✏️ Modifier le produit</h2>
                
                {/* Messages d'état */}
                {error && (
                    <div style={styles.errorMessage}>
                        {error}
                    </div>
                )}
                
                {serverStatus && (
                    <div style={styles.statusMessage}>
                        {serverStatus}
                    </div>
                )}
                
                <form onSubmit={onSubmit} style={styles.form}>
                    {/* Section photo de produit */}
                    <div style={styles.imageSection}>
                        <label style={styles.label}>Photo du produit</label>
                        
                        <div style={styles.imageUploadContainer}>
                            {imagePreview ? (
                                <div style={styles.imagePreviewContainer} className="image-preview-container">
                                    <img 
                                        src={imagePreview} 
                                        alt="Image du produit" 
                                        style={styles.imagePreview}
                                        className="image-preview"
                                    />
                                    <div style={styles.imageOverlay} className="image-overlay">
                                        <button 
                                            type="button" 
                                            onClick={triggerFileInput}
                                            style={styles.changeImageBtn}
                                            disabled={isSubmitting}
                                        >
                                            📷 Modifier
                                        </button>
                                        {newImage ? (
                                            <button 
                                                type="button" 
                                                onClick={removeImage}
                                                style={styles.cancelImageBtn}
                                                disabled={isSubmitting}
                                            >
                                                ↩️ Annuler
                                            </button>
                                        ) : (
                                            <button 
                                                type="button" 
                                                onClick={removeCurrentImage}
                                                style={styles.removeImageBtn}
                                                disabled={isSubmitting}
                                            >
                                                🗑️ Supprimer
                                            </button>
                                        )}
                                    </div>
                                    {newImage && (
                                        <div style={styles.newImageBadge}>
                                            ✨ Nouvelle image
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div 
                                    style={styles.uploadPlaceholder} 
                                    onClick={triggerFileInput}
                                    className="upload-placeholder"
                                >
                                    <div style={styles.uploadIcon} className="upload-icon">📷</div>
                                    <p style={styles.uploadText}>
                                        Cliquez pour ajouter une photo
                                    </p>
                                    <p style={styles.uploadSubtext}>
                                        JPG, PNG, GIF (max 5MB)
                                    </p>
                                </div>
                            )}
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={styles.hiddenInput}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Autres champs du formulaire */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nom du produit *</label>
                        <input
                            type="text"
                            placeholder="Entrez le nom du produit"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={styles.input}
                            className="form-input"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            placeholder="Entrez une description (optionnel)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={styles.textarea}
                            className="form-input"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Prix (FCFA) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Entrez le prix"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            style={styles.input}
                            className="form-input"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    {/* Boutons d'action */}
                    <div style={styles.buttonGroup} className="button-group">
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{...styles.button, ...styles.cancelButton}}
                            disabled={isSubmitting}
                            className="form-button cancel-button"
                        >
                            ❌ Annuler
                        </button>
                        <button
                            type="submit"
                            style={{
                                ...styles.button, 
                                ...styles.updateButton,
                                ...(isSubmitting ? styles.updateButtonDisabled : {})
                            }}
                            disabled={isSubmitting}
                            className="form-button update-button"
                        >
                            {isSubmitting ? '⏳ Mise à jour...' : '💾 Mettre à jour'}
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
        alignItems: 'flex-start',
        minHeight: 'calc(100vh - 80px)',
        padding: '20px',
        paddingTop: '10px',
    },
    formContainer: {
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        border: '1px solid #e0e6ed',
        backdropFilter: 'blur(10px)',
    },
    title: {
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: '30px',
        fontSize: '28px',
        fontWeight: 'bold',
    },
    errorMessage: {
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        color: '#e74c3c',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid rgba(231, 76, 60, 0.3)',
        fontSize: '14px',
        lineHeight: '1.5'
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
        fontWeight: 'bold'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px',
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
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    imageSection: {
        marginBottom: '30px',
    },
    imageUploadContainer: {
        position: 'relative',
        borderRadius: '15px',
        overflow: 'hidden',
    },
    uploadPlaceholder: {
        border: '3px dashed #bdc3c7',
        borderRadius: '15px',
        padding: '40px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: '#f8f9fa',
    },
    uploadIcon: {
        fontSize: '48px',
        marginBottom: '15px',
    },
    uploadText: {
        margin: '10px 0 5px 0',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    uploadSubtext: {
        margin: '0',
        fontSize: '14px',
        color: '#7f8c8d',
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: '15px',
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: '250px',
        objectFit: 'cover',
        display: 'block',
    },
    imageOverlay: {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        opacity: '0',
        transition: 'opacity 0.3s ease',
    },
    newImageBadge: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        backgroundColor: '#27ae60',
        color: '#fff',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    changeImageBtn: {
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: '#fff',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    removeImageBtn: {
        padding: '10px 20px',
        backgroundColor: '#e74c3c',
        color: '#fff',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    cancelImageBtn: {
        padding: '10px 20px',
        backgroundColor: '#f39c12',
        color: '#fff',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    hiddenInput: {
        display: 'none',
    },
    inputGroup: {
        marginBottom: '25px',
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '10px',
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: '16px',
    },
    input: {
        padding: '15px',
        fontSize: '16px',
        border: '2px solid #e0e6ed',
        borderRadius: '10px',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s ease',
    },
    textarea: {
        padding: '15px',
        fontSize: '16px',
        border: '2px solid #e0e6ed',
        borderRadius: '10px',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: '120px',
        resize: 'vertical',
        fontFamily: 'inherit',
        transition: 'border-color 0.3s ease',
    },
    buttonGroup: {
        display: 'flex',
        gap: '15px',
        marginTop: '30px',
        justifyContent: 'flex-end',
    },
    button: {
        padding: '15px 25px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontWeight: 'bold',
        minWidth: '140px',
        minHeight: '50px',
    },
    updateButton: {
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
    },
    updateButtonDisabled: {
        background: '#95a5a6',
        cursor: 'not-allowed',
        boxShadow: 'none',
    },
    cancelButton: {
        background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(149, 165, 166, 0.3)',
    },

};

// Animation CSS pour le spinner et responsive
const cssStyles = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.upload-placeholder:hover {
    border-color: #3498db !important;
    background-color: #ebf3fd !important;
    transform: translateY(-2px);
}

.image-overlay {
    opacity: 0;
    transition: opacity 0.3s ease;
}

.image-preview-container:hover .image-overlay {
    opacity: 1;
}

.form-input:focus {
    border-color: #3498db !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1) !important;
}

.update-button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4) !important;
}

.cancel-button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(149, 165, 166, 0.4) !important;
}

.update-button:disabled, .cancel-button:disabled {
    opacity: 0.6;
    transform: none !important;
    cursor: not-allowed !important;
}

/* Media Queries Responsive */
@media (max-width: 768px) {
    .outer-container {
        padding: 10px !important;
        padding-top: 10px !important;
    }
    
    .form-container {
        padding: 25px !important;
        border-radius: 15px !important;
    }
    
    .form-title {
        font-size: 24px !important;
        margin-bottom: 25px !important;
    }
    
    .button-group {
        flex-direction: column-reverse !important;
        gap: 12px !important;
    }
    
    .form-button {
        width: 100% !important;
        font-size: 16px !important;
        padding: 12px 20px !important;
    }
    
    .upload-placeholder {
        padding: 30px 15px !important;
    }
    
    .upload-icon {
        font-size: 40px !important;
    }
    
    .image-preview {
        height: 200px !important;
    }
    
    .image-overlay {
        flex-direction: column !important;
        gap: 10px !important;
    }
}
`;

// Injection des styles dans le DOM
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = cssStyles;
    if (!document.head.querySelector('[data-editproduct-styles]')) {
        styleSheet.setAttribute('data-editproduct-styles', 'true');
        document.head.appendChild(styleSheet);
    }
}

export default EditProduct;