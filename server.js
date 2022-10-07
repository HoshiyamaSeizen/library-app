import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth.js';
import booksRouter from './routes/books.js';
import ordersRouter from './routes/orders.js';
import searchRouter from './routes/search.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/auth', authRouter);
app.use('/books', booksRouter);
app.use('/orders', ordersRouter);
app.use('/search', searchRouter);
app.get('/', (req, res) => res.redirect('/auth'));
app.get('*', (req, res) => res.status(404).end('Page not found'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
