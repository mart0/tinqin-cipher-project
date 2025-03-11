type Book = {
    title: string;
    author: string;
    publicationDate: string;
}

const books: Book[] = [];

export const addBook = (book: Book) => {
    books.push(book);
};

export const searchBooks = (query: string): Book[] => {
    return books.filter(book =>
        book.title.includes(query) ||
        book.author.includes(query) ||
        book.publicationDate.includes(query)
    );
};

export const getAllBooks = (): Book[] => {
    return books;
};