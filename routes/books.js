import express from 'express';
import fs from 'fs';
import { auth } from '../middleware/auth.js';

const usersFile = './data/users.json';
const booksFile = './data/books.json';
const authorsFile = './data/authors.json';

const router = express.Router();

router.get('/', auth, (req, res) => {
	const authors = JSON.parse(fs.readFileSync(authorsFile));
	const books = JSON.parse(fs.readFileSync(booksFile)).map((book) => {
		book.author = authors.find((a) => a.id === book.author).name;
		return book;
	});
	res.render('books', { books, user: { name: req.username, id: req.id } });
});

router.get('/:id', auth, (req, res) => {
	const authors = JSON.parse(fs.readFileSync(authorsFile));
	const users = JSON.parse(fs.readFileSync(usersFile));
	const book = JSON.parse(fs.readFileSync(booksFile)).find((book) => book.id === +req.params.id);
	res.json({
		book: {
			...book,
			takenByCurrent: book.takenBy === req.id,
			author_id: book.author,
			user_id: book.takenBy,
			author: authors.find((a) => a.id === book.author).name,
			takenBy: users.find((u) => u.id === book.takenBy)?.name || null,
		},
	});
});

router.post('/add', auth, (req, res) => {
	let { title, author, date, isbn } = req.body;
	if (!(title && author && date)) return res.json('Please enter all fields');

	const authors = JSON.parse(fs.readFileSync(authorsFile));
	const books = JSON.parse(fs.readFileSync(booksFile));

	const foundAuthor = authors.find((a) => a.name === author);
	if (!foundAuthor) {
		const index = authors.at(-1).id + 1;
		authors.push({
			id: index,
			name: author,
		});
		fs.writeFileSync(authorsFile, JSON.stringify(authors, null, 2));
		author = index;
	} else author = foundAuthor.id;

	const id = books.at(-1).id + 1;
	const newBook = {
		id,
		title,
		author,
		date,
		takenBy: null,
		takenDay: null,
		returnDay: null,
		isbn,
	};
	books.push(newBook);
	fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
	res.redirect('/books');
});

router.post('/edit/:id', auth, (req, res) => {
	let { title, author, date, isbn } = req.body;
	if (!(title && author && date)) return res.json('Please enter all fields');

	const authors = JSON.parse(fs.readFileSync(authorsFile));
	let books = JSON.parse(fs.readFileSync(booksFile));

	const foundAuthor = authors.find((a) => a.name === author);
	if (!foundAuthor) {
		const index = authors.at(-1).id + 1;
		authors.push({
			id: index,
			name: author,
		});
		fs.writeFileSync(authorsFile, JSON.stringify(authors, null, 2));
		author = index;
	} else author = foundAuthor.id;

	const newBook = { title, author, date, isbn };
	books = books.map((book) => {
		if (book.id !== +req.params.id) return book;
		return { ...book, ...newBook };
	});
	fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
	res.redirect('/books');
});

router.delete('/:id', auth, (req, res) => {
	const books = JSON.parse(fs.readFileSync(booksFile)).filter(
		(book) => book.id !== +req.params.id
	);
	fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
	res.end();
});

router.post('/sort', auth, (req, res) => {
	const { tab, asc } = req.body;
	const authors = JSON.parse(fs.readFileSync(authorsFile));
	const books = JSON.parse(fs.readFileSync(booksFile))
		.map((book) => {
			book.author = authors.find((a) => a.id === book.author).name;
			return book;
		})
		.sort((a, b) => (a[tab] ? a[tab].toString().localeCompare(b[tab]) : 1));
	res.json({ books: asc === 'true' ? books : books.reverse() });
});

export default router;
