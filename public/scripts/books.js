const openInfo = (bookId) => {
	const info = document.getElementById('info');
	fetch(`/books/${bookId}`)
		.then((res) => res.json())
		.then(({ book }) => {
			document.getElementById('title').value = book.title;
			document.getElementById('author').value = book.author;
			document.getElementById('date').value = book.date;
			document.getElementById('isbn').value = book.isbn;
			document.getElementById('book_id').textContent = book.id;

			const image = document.getElementById('cover');
			image.src = './public/loading.gif';
			var downloadingImage = new Image();
			downloadingImage.onload = function () {
				image.src = this.src;
			};
			downloadingImage.src = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;

			info.getElementsByTagName('form')[0].setAttribute('action', '/books/edit/' + book.id);

			let btn = document.getElementById('delete-btn');
			updateListener(btn, (e) => deleteBook(book.id));
			btn = document.getElementById('openUser');
			updateListener(btn, (e) => lookUser(book.user_id));
			btn = document.getElementById('openAuthor');
			updateListener(btn, (e) => lookAuthor(book.author_id));

			const free = document.getElementById('free');
			const taken = document.getElementById('taken');
			if (book.takenBy === null) {
				taken.setAttribute('hidden', '');
				free.removeAttribute('hidden');

				let btn = document.getElementById('order-btn');
				updateListener(btn, () => takeBook(book.id));
			} else {
				free.setAttribute('hidden', '');
				taken.removeAttribute('hidden');

				document.getElementById('takenBy').textContent = book.takenBy;
				document.getElementById('takenDay').textContent = book.takenDay;
				document.getElementById('dueTo').textContent = book.returnDay;
				document.getElementById('outdate').innerText =
					dateNow() < book.returnDay ? '' : 'Overdue return';

				btn = document.getElementById('return-btn');
				if (book.takenByCurrent) {
					btn.removeAttribute('hidden');
					updateListener(btn, () => returnBook(book.id));
				} else btn.setAttribute('hidden', '');
			}
			openInfoModule();
		})
		.catch((err) => console.log(err));
};

const takeBook = (id) => {
	const takenDay = dateNow();
	const returnDay = document.getElementById('order-date').value;

	if (!returnDay)
		return (document.getElementById('date-err').innerText = 'You should fill the return day');
	if (takenDay >= returnDay)
		return (document.getElementById('date-err').innerText = 'Invalid return day');

	fetch(`/orders/take/${id}`, {
		method: 'POST',
		body: new URLSearchParams({ takenDay, returnDay }),
	}).then(() => window.location.reload());
};

const returnBook = (id) => {
	fetch(`/orders/return/${id}`, { method: 'POST' }).then(() => window.location.reload());
};

const deleteBook = (id) => {
	if (confirm('Are you sure you want to delete this book?'))
		fetch(`/books/${id}`, { method: 'DELETE' }).then(() => window.location.reload());
};

const lookAuthor = async (id) => {
	const res = await fetch(`/search/author/${id}`, { method: 'POST' });
	const { author, books } = await res.json();

	const authorModal = document.getElementById('author-dialog');
	authorModal.getElementsByTagName('span')[0].textContent = author;
	const ol = authorModal.getElementsByTagName('ol')[0];
	ol.innerHTML = '';
	books.forEach((book) => {
		const li = document.createElement('li');
		li.innerText = `${book.title} (${book.date})`;
		li.addEventListener('click', () => {
			closeDialog(document.getElementById('info'));
			openInfo(book.id);
		});
		ol.appendChild(li);
	});

	document.getElementById('author-dialog').showModal();
};

const lookUser = async (id) => {
	const res = await fetch(`/search/user/${id}`, { method: 'POST' });
	const { user, books } = await res.json();

	const userModal = document.getElementById('user-dialog');
	userModal.getElementsByTagName('span')[0].textContent = user;
	const ol = userModal.getElementsByTagName('ol')[0];
	ol.innerHTML = '';
	books.forEach((book) => {
		const li = document.createElement('li');
		li.innerText = `${book.title} (${book.date}) by ${book.author}`;
		ol.appendChild(li);
	});

	document.getElementById('user-dialog').showModal();
};

const sortTable = async (th, tab) => {
	const tbody = th.closest('table').querySelector('tbody');
	const ths = Array.from(th.parentNode.children);

	const res = await fetch(`/books/sort/`, {
		method: 'POST',
		body: new URLSearchParams({ tab, asc: (th.asc = !th.asc) }),
	});
	const { books } = await res.json();

	tbody.innerHTML = '';
	books.forEach((book) => {
		const tr = tbody.insertRow();
		tr.addEventListener('click', () => openInfo(book.id));
		const title = tr.insertCell();
		const author = tr.insertCell();
		const date = tr.insertCell();
		const stock = tr.insertCell();
		title.innerText = book.title;
		author.innerText = book.author;
		date.innerText = book.date;
		stock.innerHTML =
			'<i class="fa-solid ' + (book.takenBy === null ? 'fa-check' : 'fa-xmark') + '"></i>';
	});

	ths.forEach((header) => {
		if (header !== th) header.asc = false;
		const i = header.getElementsByTagName('i')[0];
		i.classList.remove('fa-sort-up');
		i.classList.remove('fa-sort-down');
		i.classList.add('fa-sort');
		if (header === th) {
			i.classList.remove('fa-sort');
			i.classList.add(th.asc ? 'fa-sort-up' : 'fa-sort-down');
		}
	});
};
const logout = () => fetch('/auth/logout').then(() => window.location.reload());

const openAddModule = () => document.getElementById('add').showModal();
const closeDialog = (el) => el.closest('dialog').close();
const openInfoModule = () => {
	document.getElementById('dialog-hide').hidden = true;
	document.getElementById('info').showModal();
	setTimeout(() => (document.getElementById('dialog-hide').hidden = false), 1);
};

const dateNow = () => {
	const today = new Date();
	const yyyy = today.getFullYear();
	let mm = today.getMonth() + 1;
	let dd = today.getDate();

	if (dd < 10) dd = '0' + dd;
	if (mm < 10) mm = '0' + mm;

	return yyyy + '-' + mm + '-' + dd;
};

const updateListener = (btn, cb) => {
	clone = btn.cloneNode(true);
	clone.addEventListener('click', cb);
	btn.parentNode.replaceChild(clone, btn);
};
