import express from 'express';
import fs from 'fs';
import { auth } from '../middleware/auth.js';

const usersFile = './data/users.json';
const booksFile = './data/books.json';
const authorsFile = './data/authors.json';

const router = express.Router();

router.post('/user/:id', auth, (req, res) => {
	const authors = JSON.parse(fs.readFileSync(authorsFile));
	const user = JSON.parse(fs.readFileSync(usersFile)).find((u) => u.id === +req.params.id).name;
	const books = JSON.parse(fs.readFileSync(booksFile))
		.filter((book) => book.takenBy === +req.params.id)
		.map((book) => {
			book.author = authors.find((a) => a.id === book.author).name;
			return book;
		});
	res.json({ user, books });
});

router.post('/author/:id', auth, (req, res) => {
	const author = JSON.parse(fs.readFileSync(authorsFile)).find(
		(a) => a.id === +req.params.id
	).name;
	const books = JSON.parse(fs.readFileSync(booksFile)).filter(
		(book) => book.author === +req.params.id
	);
	res.json({ author, books });
});

export default router;
