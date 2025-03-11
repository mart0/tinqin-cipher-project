import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AddBook, AllBooks } from './pages';
import { KeyProvider } from './utils/KeyContext';
import { NavigationContainer } from './navigation';
import './App.css';

const App: React.FC = () => {
    return (
        <KeyProvider>
            <Router>
                <div className="app">
                    <NavigationContainer>
                        <Routes>
                            <Route path="/" element={<AllBooks />} />
                            <Route path="/addBook" element={<AddBook />} />
                        </Routes>
                    </NavigationContainer>
                </div>
            </Router>
        </KeyProvider>
    );
};

export default App;