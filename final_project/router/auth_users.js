const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(u => u.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(u => u.username === username && u.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ data: username }, "access", { expiresIn: 60 * 60 });
        req.session.authorization = { accessToken };
        return res.status(200).json({ message: "Login successful!", accessToken });
    } else {
        return res.status(401).json({ message: "Invalid login. Check username and password" });
    }
});

// Add or update a book review (authenticated users only)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.data;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    books[isbn].reviews[username] = review;
    return res.status(200).json({
        message: `Review for ISBN ${isbn} added/updated successfully`,
        reviews: books[isbn].reviews
    });
});

// Delete a book review (authenticated users only)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.data;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this user" });
    }

    delete books[isbn].reviews[username];
    return res.status(200).json({
        message: `Review for ISBN ${isbn} deleted successfully`,
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
