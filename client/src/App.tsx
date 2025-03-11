import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AddBook from './pages/AddBook';
import AllBooks from './pages/AllBooks';
import './App.css';

const App: React.FC = () => {
    return (
        <Router>
            <div className="app">
                <nav className="navbar">
                    <h1>Book Manager</h1>
                    <div className="nav-links">
                        <Link to="/">All Books</Link>
                        <Link to="/addBook">Add Book</Link>
                    </div>
                </nav>

                <div className="container">
                    <Routes>
                        <Route path="/" element={<AllBooks />} />
                        <Route path="/addBook" element={<AddBook />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;