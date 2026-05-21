const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const BASE_URL = "http://localhost:5000";

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists. Please choose a different username." });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const matchedBooks = Object.entries(books)
        .filter(([, book]) => book.author.toLowerCase() === author.toLowerCase())
        .map(([isbn, book]) => ({ isbn, ...book }));

    if (matchedBooks.length > 0) {
        return res.status(200).json({ books: matchedBooks });
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const matchedBooks = Object.entries(books)
        .filter(([, book]) => book.title.toLowerCase() === title.toLowerCase())
        .map(([isbn, book]) => ({ isbn, ...book }));

    if (matchedBooks.length > 0) {
        return res.status(200).json({ books: matchedBooks });
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// --- Async/Await versions using Axios ---

// Task 10: Get all books using async/await with Axios
public_users.get('/async/books', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Task 11: Get book by ISBN using async/await with Axios
public_users.get('/async/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(error.response?.status || 500).json({ message: error.response?.data?.message || "Error fetching book" });
    }
});

// Task 12: Get books by author using async/await with Axios
public_users.get('/async/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(error.response?.status || 500).json({ message: error.response?.data?.message || "Error fetching books" });
    }
});

// Task 13: Get books by title using async/await with Axios
public_users.get('/async/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(error.response?.status || 500).json({ message: error.response?.data?.message || "Error fetching books" });
    }
});

module.exports.general = public_users;
