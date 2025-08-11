// src/api/config.js - Configuration pour FastAPI backend

import axios from 'axios';

const API_BASE_URL = 'https://backend-produit-12.onrender.com';

// Configuration axios avec gestion des erreurs et retry
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 secondes pour les uploads d'images
  headers: {
    'Accept': 'application/json',
  }
});

// Fonction pour compresser les images avant upload
const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculer les nouvelles dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convertir en blob
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// État du serveur
let serverStatus = {
  isAwake: false,
  lastWakeUp: null,
  isWaking: false
};

// Intercepteur pour gérer les erreurs automatiquement
apiClient.interceptors.response.use(
  (response) => {
    // Marquer le serveur comme éveillé en cas de succès
    serverStatus.isAwake = true;
    serverStatus.lastWakeUp = Date.now();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si le serveur est endormi (503, 502, timeout)
    if (
      (error.response?.status === 503 || 
       error.response?.status === 502 || 
       error.code === 'ECONNABORTED') && 
      !originalRequest._retry
    ) {
      console.log('🔄 Serveur en veille, tentative de réveil...');
      serverStatus.isAwake = false;
      originalRequest._retry = true;
      
      // Attendre 5 secondes puis réessayer
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        await wakeUpServer();
        return apiClient(originalRequest);
      } catch (wakeError) {
        console.error('❌ Impossible de réveiller le serveur:', wakeError);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Intercepteur pour ajouter des logs de debug
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Fonction pour réveiller le serveur avec gestion d'état
export const wakeUpServer = async () => {
  // Si le serveur a été réveillé récemment (moins de 5 minutes), skip
  if (serverStatus.isAwake && 
      serverStatus.lastWakeUp && 
      (Date.now() - serverStatus.lastWakeUp) < 300000) {
    console.log('✅ Serveur déjà éveillé récemment');
    return true;
  }

  // Si un réveil est déjà en cours, attendre
  if (serverStatus.isWaking) {
    console.log('⏳ Réveil en cours, attente...');
    let attempts = 0;
    while (serverStatus.isWaking && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    return serverStatus.isAwake;
  }

  try {
    console.log('☕ Réveil du serveur...');
    serverStatus.isWaking = true;
    
    await apiClient.get('/health', { 
      timeout: 45000,
      _retry: true // Éviter le retry sur cette requête
    });
    
    serverStatus.isAwake = true;
    serverStatus.lastWakeUp = Date.now();
    console.log('✅ Serveur réveillé !');
    return true;
  } catch (error) {
    console.warn('⚠️ Impossible de réveiller le serveur:', error.message);
    serverStatus.isAwake = false;
    return false;
  } finally {
    serverStatus.isWaking = false;
  }
};

// Fonction pour vérifier la santé du serveur
export const checkServerHealth = async () => {
  try {
    const response = await apiClient.get('/health', { timeout: 10000 });
    return {
      status: 'healthy',
      data: response.data,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: Date.now()
    };
  }
};

// API Functions pour FastAPI
export const productAPI = {
  // Récupérer tous les produits
  getAll: async () => {
    await wakeUpServer(); // Réveiller avant la requête principale
    const response = await apiClient.get('/products/');
    return Array.isArray(response.data) ? response.data : [];
  },

  // Créer un produit avec image
  create: async (productData, options = {}) => {
    await wakeUpServer(); // Réveiller le serveur
    
    // Créer FormData pour FastAPI
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description || '');
    formData.append('price', productData.price.toString());
    
    if (productData.image) {
      let imageToUpload = productData.image;
      
      // Compresser l'image si elle est trop grande (>1MB)
      if (options.compressImages !== false && productData.image.size > 1024 * 1024) {
        console.log('🗜️ Compression de l\'image...');
        try {
          imageToUpload = await compressImage(productData.image);
          console.log(`✂️ Image compressée: ${Math.round(productData.image.size/1024)}KB → ${Math.round(imageToUpload.size/1024)}KB`);
        } catch (compressionError) {
          console.warn('⚠️ Échec de la compression, utilisation de l\'image originale');
          imageToUpload = productData.image;
        }
      }
      
      formData.append('image', imageToUpload);
    }

    console.log('📤 Envoi des données:', {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      hasImage: !!productData.image,
      imageSize: productData.image ? `${Math.round(productData.image.size/1024)}KB` : 'N/A'
    });

    const response = await apiClient.post('/products/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes pour les gros uploads
      onUploadProgress: options.onProgress || ((progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`📊 Upload: ${percentCompleted}%`);
      })
    });

    return response.data;
  },

  // Modifier un produit
  update: async (id, productData, options = {}) => {
    await wakeUpServer();
    
    // Créer FormData pour FastAPI
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description || '');
    formData.append('price', productData.price.toString());
    
    // Gestion de l'image
    if (productData.image) {
      let imageToUpload = productData.image;
      
      // Compresser l'image si elle est trop grande (>1MB)
      if (options.compressImages !== false && productData.image.size > 1024 * 1024) {
        console.log('🗜️ Compression de l\'image...');
        try {
          imageToUpload = await compressImage(productData.image);
          console.log(`✂️ Image compressée: ${Math.round(productData.image.size/1024)}KB → ${Math.round(imageToUpload.size/1024)}KB`);
        } catch (compressionError) {
          console.warn('⚠️ Échec de la compression, utilisation de l\'image originale');
          imageToUpload = productData.image;
        }
      }
      
      formData.append('image', imageToUpload);
    }
    
    // Marquer pour supprimer l'image existante
    if (productData.removeImage) {
      formData.append('remove_image', 'true');
    }

    console.log('📝 Mise à jour du produit:', {
      id,
      name: productData.name,
      hasNewImage: !!productData.image,
      removeImage: !!productData.removeImage
    });

    const response = await apiClient.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000,
      onUploadProgress: options.onProgress || ((progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`📊 Upload: ${percentCompleted}%`);
      })
    });

    return response.data;
  },

  // Supprimer un produit
  delete: async (id) => {
    await wakeUpServer();
    console.log('🗑️ Suppression du produit:', id);
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  // Récupérer un produit par ID
  getById: async (id) => {
    await wakeUpServer();
    console.log('🔍 Récupération du produit:', id);
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Rechercher des produits
  search: async (query, options = {}) => {
    await wakeUpServer();
    const params = new URLSearchParams({
      q: query,
      ...options
    });
    
    console.log('🔎 Recherche:', query);
    const response = await apiClient.get(`/products/search?${params}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  // Obtenir les statistiques
  getStats: async () => {
    await wakeUpServer();
    try {
      const response = await apiClient.get('/products/stats');
      return response.data;
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer les statistiques');
      return { total: 0, average_price: 0 };
    }
  }
};

// Fonction utilitaire pour formater les erreurs
export const formatApiError = (error) => {
  if (error.code === 'ECONNABORTED') {
    return '⏰ Timeout: Le serveur met trop de temps à répondre. Le serveur Render était peut-être endormi.';
  } else if (error.code === 'ERR_NETWORK') {
    return '🌐 Erreur réseau: Impossible de contacter le serveur. Vérifiez votre connexion.';
  } else if (error.response?.status === 413) {
    return '📸 Image trop volumineuse: Réduisez la taille de votre image.';
  } else if (error.response?.status === 400) {
    return `❌ Données invalides: ${error.response?.data?.detail || 'Vérifiez vos informations.'}`;
  } else if (error.response?.status === 404) {
    return '🔍 Ressource introuvable: L\'élément demandé n\'existe pas.';
  } else if (error.response?.status === 503) {
    return '😴 Serveur en maintenance: Le serveur Render redémarre, réessayez dans 30 secondes.';
  } else {
    return `❌ Erreur: ${error.response?.data?.detail || error.message || 'Une erreur inattendue est survenue.'}`;
  }
};

// Fonction pour nettoyer les ressources
export const cleanup = () => {
  serverStatus = {
    isAwake: false,
    lastWakeUp: null,
    isWaking: false
  };
};

export default apiClient;