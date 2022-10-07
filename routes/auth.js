import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { notAuth } from '../middleware/auth.js';

const usersFile = './data/users.json';

const router = express.Router();

router.get('/', notAuth, (req, res) => {
	res.render('auth');
});

router.post('/login', notAuth, async (req, res) => {
	const { email, password } = req.body;

	// Basic validation
	if (!(email && password)) return res.render('auth', { error: 'Please enter all fields' });

	// Read users
	const users = JSON.parse(fs.readFileSync(usersFile));

	// Check if user exists
	const user = users.find((user) => user.email === email);
	if (!user) return res.render('auth', { error: 'There is not user with that email' });

	// Check password
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) return res.render('auth', { error: 'Wrong password' });

	// Create token
	const token = await jwt.sign({ id: user.id, username: user.name }, process.env.JWT_SECRET, {
		expiresIn: '1d',
	});
	if (!token) return res.render('auth', { error: 'Error while generating a token' });

	// Return user and token
	res.cookie('token', token);
	res.redirect('/books');
});

router.post('/register', notAuth, async (req, res) => {
	const { name, email, password, password1 } = req.body;

	// Basic validation
	if (!(name && email && password && password1)) return res.json('Please enter all fields');
	if (password !== password1) return res.render('auth', { error: 'Passwords should match' });

	// Read users
	const users = JSON.parse(fs.readFileSync(usersFile));

	// Check if user already exists
	const user = users.find((user) => user.email === email);
	if (user) return res.render('auth', { error: 'User with that email already exists' });

	// Hash password
	const salt = await bcrypt.genSalt(12);
	if (!salt) return res.render('auth', { error: 'Something wrong with bcrypt.js' });
	const hash = await bcrypt.hash(password, salt);
	if (!hash) return res.render('auth', { error: 'Error while hasing the password' });

	// Generate id
	const id = users.length && users.at(-1).id + 1;

	// Save user
	const newUser = { id, name, email, password: hash };
	users.push(newUser);
	fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

	// Create token
	const token = await jwt.sign(
		{ id: newUser.id, username: newUser.name },
		process.env.JWT_SECRET,
		{
			expiresIn: '1d',
		}
	);
	if (!token) return res.render('auth', { error: 'Error while generating a token' });

	res.cookie('token', token);
	res.redirect('/books');
});

router.get('/logout', (req, res) => {
	res.clearCookie('token');
	res.redirect('/auth');
});

export default router;
