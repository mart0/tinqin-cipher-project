import React from 'react';
import '../styles/AddBook.css';
import AddBookContainer from './components/AddBookContainer';

const AddBook: React.FC = () => {
    return (
        <div className="add-book-container">
            <h1>Add New Book</h1>

            <AddBookContainer />
        </div>
    );
};

export default AddBook;