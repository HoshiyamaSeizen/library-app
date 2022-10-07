import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) return res.status(403).redirect('/auth');

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.id = decoded.id;
		req.username = decoded.username;
		next();
	} catch (e) {
		res.status(403).redirect('/auth');
	}
};

export const notAuth = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) return next();

	try {
		jwt.verify(token, process.env.JWT_SECRET);
		res.redirect('/books');
	} catch (e) {
		next();
	}
};
