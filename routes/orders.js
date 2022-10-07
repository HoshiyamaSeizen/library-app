import express from 'express';
import fs from 'fs';
import { auth } from '../middleware/auth.js';

const booksFile = './data/books.json';

const router = express.Router();

router.post('/take/:id', auth, (req, res) => {
	const { takenDay, returnDay } = req.body;
	const books = JSON.parse(fs.readFileSync(booksFile)).map((book) => {
		if (book.id === +req.params.id) {
			(book.takenDay = takenDay), (book.returnDay = returnDay), (book.takenBy = req.id);
		}
		return book;
	});
	fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
	res.end();
});

router.post('/return/:id', auth, (req, res) => {
	const books = JSON.parse(fs.readFileSync(booksFile)).map((book) => {
		if (book.id === +req.params.id) {
			(book.takenDay = null), (book.returnDay = null), (book.takenBy = null);
		}
		return book;
	});
	fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
	res.end();
});

export default router;
