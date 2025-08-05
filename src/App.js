import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';

function App() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <Router>
            <nav style={styles.navbar}>
                <div style={styles.left}>
                    <Link to="/add" style={styles.button}>Add Product</Link>
                </div>
                <div style={styles.center}>
                    <h2 style={{ margin: 0 }}>Product Management Application</h2>
                </div>
                <div style={styles.right}>
                    <input
                        type="text"
                        placeholder="Search product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.search}
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

const styles = {
    navbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        backgroundColor: '#333',
        padding: '15px 30px',
        color: '#fff',
        // Propriétés ajoutées pour fixer la barre de navigation
        position: 'fixed', 
        top: 0,
        width: '100%',
        zIndex: 1000, 
    },
    left: { flex: 1, minWidth: '150px', marginBottom: '10px' },
    center: { flex: 1, textAlign: 'center', minWidth: '200px', marginBottom: '10px' },
    right: { flex: 1, textAlign: 'right', minWidth: '150px' },
    button: {
        background: '#4CAF50',
        color: '#fff',
        padding: '10px 20px',
        textDecoration: 'none',
        borderRadius: '4px',
    },
    search: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        maxWidth: '100%',
    },
};


export default App;