// App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import './App.css'; 

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <Router>
            <nav className="navbar">
                <div className="navbarInner">
                    {/* Bouton pour ajouter un produit (toujours affiché) */}
                    <div className="navbarLeft">
                        <Link to="/add" className="button" onClick={() => setIsMenuOpen(false)}>
                            Ajouter un produit
                        </Link>
                    </div>

                    {/* Titre de l'application (toujours au centre sur les grands écrans) */}
                    <div className="navbarCenter">
                        <h2 className="titleDesktop">Application de gestion de produits</h2>
                    </div>

                    {/* Barre de recherche (toujours à droite) */}
                    <div className="navbarRight">
                        <input
                            type="text"
                            placeholder="Rechercher un produit…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search"
                        />
                    </div>
                </div>

                {/* Section mobile avec menu burger et titre */}
                <div className="mobileHeader">
                    <h2 className="titleMobile">Application de gestion de produits</h2>
                    <button className="menuToggle" onClick={toggleMenu}>
                        ☰
                    </button>
                </div>

                {/* Contenu du menu mobile (bouton et recherche) */}
                <div className={`mobileMenu ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/add" className="buttonMobile" onClick={() => setIsMenuOpen(false)}>
                        Ajouter un produit
                    </Link>
                    <input
                        type="text"
                        placeholder="Rechercher un produit…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="searchMobile"
                    />
                </div>
            </nav>

            <div style={{ padding: '30px', paddingTop: '80px' }}>
                <Routes>
                    <Route path="/" element={<ProductList searchTerm={searchTerm} />} />
                    <Route path="/add" element={<AddProduct />} />
                    <Route path="/edit/:id" element={<EditProduct />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;