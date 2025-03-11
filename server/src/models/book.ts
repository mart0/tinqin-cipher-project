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
    const normalizedQuery = query.toLowerCase().trim();

    return books.filter(book =>
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.author.toLowerCase().includes(normalizedQuery) ||
        book.publicationDate.toLowerCase().includes(normalizedQuery)
    );
};

export const getAllBooks = (): Book[] => {
    return books;
};