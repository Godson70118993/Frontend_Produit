import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';


function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <Router>
            {/* Navigation responsive */}
            <nav style={styles.navbar}>
                {/* Version Desktop */}
                <div style={styles.desktopNav} className="desktop-nav">
                    <div style={styles.navbarContent}>
                        {/* Bouton Ajouter (gauche) */}
                        <div style={styles.navLeft}>
                            <Link 
                                to="/add" 
                                style={styles.addButton}
                                className="add-button"
                            >
                                ➕ Ajouter un produit
                            </Link>
                        </div>

                        {/* Titre (centre) */}
                        <div style={styles.navCenter}>
                            <Link to="/" style={styles.titleLink}>
                                <h1 style={styles.appTitle}>
                                    🏪 Application de gestion de produits
                                </h1>
                            </Link>
                        </div>

                        {/* Recherche (droite) */}
                        <div style={styles.navRight}>
                            <div style={styles.searchContainer}>
                                <input
                                    type="text"
                                    placeholder="🔍 Rechercher un produit..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={styles.searchInput}
                                    className="search-input"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Version Mobile */}
                <div style={styles.mobileNav} className="mobile-nav">
                    <div style={styles.mobileHeader}>
                        <Link to="/" style={styles.titleLinkMobile} onClick={closeMenu}>
                            <h1 style={styles.appTitleMobile}>
                                🏪 Gestion Produits
                            </h1>
                        </Link>
                        
                        <button 
                            style={styles.menuToggle} 
                            onClick={toggleMenu}
                            className="menu-toggle"
                        >
                            <span style={{
                                ...styles.hamburgerLine,
                                transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
                            }}></span>
                            <span style={{
                                ...styles.hamburgerLine,
                                opacity: isMenuOpen ? '0' : '1'
                            }}></span>
                            <span style={{
                                ...styles.hamburgerLine,
                                transform: isMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
                            }}></span>
                        </button>
                    </div>

                    {/* Menu mobile déroulant */}
                    <div 
                        style={{
                            ...styles.mobileMenu,
                            maxHeight: isMenuOpen ? '300px' : '0',
                            opacity: isMenuOpen ? '1' : '0',
                        }} 
                        className="mobile-menu"
                    >
                        <div style={styles.mobileMenuContent}>
                            <Link 
                                to="/add" 
                                style={styles.addButtonMobile}
                                className="add-button-mobile"
                                onClick={closeMenu}
                            >
                                ➕ Ajouter un produit
                            </Link>
                            
                            <div style={styles.searchContainerMobile}>
                                <input
                                    type="text"
                                    placeholder="🔍 Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={styles.searchInputMobile}
                                    className="search-input-mobile"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overlay pour fermer le menu mobile */}
                {isMenuOpen && (
                    <div 
                        style={styles.overlay} 
                        onClick={closeMenu}
                        className="mobile-overlay"
                    ></div>
                )}
            </nav>

            {/* Contenu principal */}
            <main style={styles.mainContent}>
                <Routes>
                    <Route path="/" element={<ProductList searchTerm={searchTerm} />} />
                    <Route path="/add" element={<AddProduct />} />
                    <Route path="/edit/:id" element={<EditProduct />} />
                </Routes>
            </main>
        </Router>
    );
}

const styles = {
    navbar: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
    },
    
    // Navigation Desktop
    desktopNav: {
        display: 'none',
        '@media (min-width: 769px)': {
            display: 'block',
        }
    },
    navbarContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 30px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    navLeft: {
        flex: '0 0 auto',
    },
    navCenter: {
        flex: '1',
        display: 'flex',
        justifyContent: 'center',
        margin: '0 20px',
    },
    navRight: {
        flex: '0 0 auto',
    },
    addButton: {
        backgroundColor: '#27ae60',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '25px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '14px',
        boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap',
    },
    titleLink: {
        textDecoration: 'none',
        color: 'inherit',
    },
    appTitle: {
        margin: 0,
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'color 0.3s ease',
    },
    searchContainer: {
        position: 'relative',
    },
    searchInput: {
        padding: '12px 20px',
        borderRadius: '25px',
        border: '2px solid #e0e6ed',
        fontSize: '14px',
        width: '250px',
        transition: 'all 0.3s ease',
        backgroundColor: '#fff',
    },

    // Navigation Mobile
    mobileNav: {
        display: 'block',
        '@media (min-width: 769px)': {
            display: 'none',
        }
    },
    mobileHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 20px',
    },
    titleLinkMobile: {
        textDecoration: 'none',
        color: 'inherit',
        flex: 1,
    },
    appTitleMobile: {
        margin: 0,
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    menuToggle: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        width: '30px',
        height: '30px',
    },
    hamburgerLine: {
        width: '25px',
        height: '3px',
        backgroundColor: '#2c3e50',
        borderRadius: '3px',
        transition: 'all 0.3s ease',
        transformOrigin: 'center',
    },
    mobileMenu: {
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        backgroundColor: '#fff',
        borderTop: '1px solid rgba(0,0,0,0.1)',
    },
    mobileMenuContent: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    addButtonMobile: {
        backgroundColor: '#27ae60',
        color: '#fff',
        padding: '15px 20px',
        borderRadius: '12px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '16px',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
        transition: 'all 0.3s ease',
    },
    searchContainerMobile: {
        position: 'relative',
    },
    searchInputMobile: {
        padding: '15px 20px',
        borderRadius: '12px',
        border: '2px solid #e0e6ed',
        fontSize: '16px',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
        backgroundColor: '#f8f9fa',
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: -1,
    },
    mainContent: {
        paddingTop: '80px', // Espace pour la navbar fixe
        minHeight: '100vh',
    },
};

// Styles CSS avancés avec pseudo-classes
const cssStyles = `
/* Navigation Desktop */
@media (min-width: 769px) {
    .desktop-nav {
        display: block !important;
    }
    .mobile-nav {
        display: none !important;
    }
}

@media (max-width: 768px) {
    .desktop-nav {
        display: none !important;
    }
    .mobile-nav {
        display: block !important;
    }
}

/* Effets hover pour bouton Ajouter */
.add-button:hover {
    background-color: #219a52 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4) !important;
}

.add-button-mobile:hover {
    background-color: #219a52 !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4) !important;
}

/* Effets hover pour titre */
.app-title:hover {
    color: #3498db !important;
}

/* Effets focus pour recherche */
.search-input:focus {
    outline: none !important;
    border-color: #3498db !important;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1) !important;
    width: 280px !important;
}

.search-input-mobile:focus {
    outline: none !important;
    border-color: #3498db !important;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1) !important;
    background-color: #fff !important;
}

/* Animation du menu toggle */
.menu-toggle:hover {
    background-color: rgba(52, 152, 219, 0.1) !important;
    border-radius: 50% !important;
}

.menu-toggle:active {
    transform: scale(0.95);
}

/* Animation du menu mobile */
.mobile-menu {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Responsive breakpoints supplémentaires */
@media (max-width: 480px) {
    .app-title-mobile {
        font-size: 16px !important;
    }
    
    .mobile-header {
        padding: 12px 15px !important;
    }
    
    .mobile-menu-content {
        padding: 15px !important;
        gap: 12px !important;
    }
    
    .add-button-mobile {
        padding: 12px 16px !important;
        font-size: 14px !important;
    }
    
    .search-input-mobile {
        padding: 12px 16px !important;
        font-size: 14px !important;
    }
}

@media (min-width: 1200px) {
    .search-input:focus {
        width: 320px !important;
    }
}

/* Animations d'entrée */
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.mobile-menu.open {
    animation: slideDown 0.3s ease !important;
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Mode sombre (optionnel) */
@media (prefers-color-scheme: dark) {
    .navbar {
        background-color: rgba(44, 62, 80, 0.95) !important;
        color: #fff !important;
    }
    
    .app-title, .app-title-mobile {
        color: #ecf0f1 !important;
    }
    
    .search-input, .search-input-mobile {
        background-color: #34495e !important;
        color:rgb(0, 0, 0) !important;
        border-color:rgb(0, 0, 0) !important;
    }
    
    
}
`;

// Injection des styles dans le DOM
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = cssStyles;
    if (!document.head.querySelector('[data-app-styles]')) {
        styleSheet.setAttribute('data-app-styles', 'true');
        document.head.appendChild(styleSheet);
    }
}

export default App;