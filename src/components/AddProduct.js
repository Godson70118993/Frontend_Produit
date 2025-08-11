import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// import { productAPI } from '../api/config'; // Commenté car nous utilisons directement axios

const AddProduct = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [serverStatus, setServerStatus] = useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // URL de base de l'API
    const API_BASE_URL = 'https://backend-produit-12.onrender.com';

    // Gestion de l'upload d'image
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

            setImage(file);
            setError('');
            
            // Créer un aperçu de l'image
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

    // Supprimer l'image sélectionnée
    const removeImage = () => {
        setImage(null);
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
        setServerStatus('Connexion au serveur...');

        try {
            // ✅ CORRECTION : Utiliser FormData pour envoyer l'image
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('description', description.trim());
            formData.append('price', parseFloat(price));
            
            // Ajouter l'image si elle existe
            if (image) {
                formData.append('image', image);
            }

            setServerStatus('Envoi du produit...');
            
            // ✅ CORRECTION : Envoyer avec les bons headers
            const response = await fetch(`${API_BASE_URL}/products/`, {
                method: 'POST',
                body: formData, // Ne pas définir Content-Type, le navigateur le fait automatiquement
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
            }

            const result = await response.json();
            
            setServerStatus('Produit créé avec succès !');
            console.log('Produit créé:', result);
            
            // Redirection après succès
            setTimeout(() => {
                navigate('/');
            }, 1000);
            
        } catch (error) {
            console.error("Erreur lors de la création du produit :", error);
            
            // Gestion spécifique des erreurs
            if (error.name === 'TypeError') {
                setError('🌐 Erreur réseau: Impossible de contacter le serveur. Vérifiez votre connexion.');
            } else if (error.message.includes('413')) {
                setError('📸 Image trop volumineuse: Réduisez la taille de votre image.');
            } else if (error.message.includes('400')) {
                setError(`❌ Données invalides: ${error.message}`);
            } else if (error.message.includes('503')) {
                setError('😴 Serveur en maintenance: Le serveur Render redémarre, réessayez dans 30 secondes.');
            } else {
                setError(`❌ Erreur: ${error.message || 'Une erreur inattendue est survenue.'}`);
            }
            
            setServerStatus('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onCancel = () => {
        navigate('/');
    };
    
    return (
        <div style={styles.outerContainer} className="outer-container">
            <div style={styles.formContainer} className="form-container">
                <h2 style={styles.title} className="form-title">➕ Ajouter un produit</h2>
                
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
                                        alt="Aperçu" 
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
                                        <button 
                                            type="button" 
                                            onClick={removeImage}
                                            style={styles.removeImageBtn}
                                            disabled={isSubmitting}
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    style={styles.uploadPlaceholder} 
                                    onClick={triggerFileInput}
                                    className="upload-placeholder"
                                >
                                    <div style={styles.uploadIcon}>📷</div>
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
                            className="form-input form-textarea"
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
                            onClick={onCancel} 
                            style={{...styles.button, ...styles.cancelButton}}
                            className="form-button cancel-button"
                            disabled={isSubmitting}
                        >
                            ❌ Annuler
                        </button>
                        <button 
                            type="submit" 
                            style={{
                                ...styles.button, 
                                ...styles.submitButton,
                                ...(isSubmitting ? styles.submitButtonDisabled : {})
                            }} 
                            className="form-button submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '⏳ Ajout en cours...' : '✅ Ajouter le produit'}
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        opacity: '0',
        transition: 'opacity 0.3s ease',
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
        flexDirection: 'row',
    },
    button: {
        flex: 1,
        padding: '15px 25px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontWeight: 'bold',
        minHeight: '50px',
    },
    submitButton: {
        background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)',
    },
    submitButtonDisabled: {
        background: '#95a5a6',
        cursor: 'not-allowed',
        boxShadow: 'none',
    },
    cancelButton: {
        background: 'linear-gradient(135deg, #95a5a6, #bdc3c7)',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(149, 165, 166, 0.3)',
    },


};

// Styles CSS pour les media queries et animations
const cssStyles = `
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

.submit-button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4) !important;
}

.cancel-button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(149, 165, 166, 0.4) !important;
}

.submit-button:disabled, .cancel-button:disabled {
    opacity: 0.6;
    transform: none !important;
    cursor: not-allowed !important;
}

/* Media Queries Responsive */
@media (max-width: 768px) {
    .outer-container {
        padding: 10px !important;
        padding-top: 5px !important;
    }
    
    .form-container {
        padding: 20px !important;
        border-radius: 15px !important;
    }
    
    .form-title {
        font-size: 24px !important;
        margin-bottom: 20px !important;
    }
    
    .button-group {
        flex-direction: column !important;
        gap: 10px !important;
    }
    
    .form-button {
        width: 100% !important;
        padding: 12px !important;
    }
    
    .image-preview {
        height: 200px !important;
    }
    
    .upload-placeholder {
        padding: 30px 15px !important;
    }
    
    .form-input {
        padding: 12px !important;
    }
    
    .form-textarea {
        padding: 12px !important;
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
    if (!document.head.querySelector('[data-addproduct-styles]')) {
        styleSheet.setAttribute('data-addproduct-styles', 'true');
        document.head.appendChild(styleSheet);
    }
}

export default AddProduct;