type Book = {
    title: string;
    author: string;
    year: number;
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
        book.year.toString().includes(normalizedQuery)
    );
};

export const getAllBooks = (): Book[] => {
    return books;
};