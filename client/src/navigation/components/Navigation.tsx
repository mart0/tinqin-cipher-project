import React from 'react';
import { Link } from 'react-router-dom';

interface NavigationProps {
    title?: string;
}

const Navigation: React.FC<NavigationProps> = ({ title = 'Book Manager' }) => {
    return (
        <nav className="navbar">
            <h1>{title}</h1>
            <div className="nav-links">
                <Link to="/">All Books</Link>
                <Link to="/addBook">Add Book</Link>
            </div>
        </nav>
    );
};

export default Navigation; 