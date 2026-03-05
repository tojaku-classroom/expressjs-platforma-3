const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { requireGuest, requireAuth } = require('../lib/auth');

router.get('/signup', requireGuest, (req, res) => {
  res.render('signup', { error: null });
});

router.post('/signup', requireGuest, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.render('signup', { error: 'Unos podataka je obvezan' });
    }

    if (password.length < 6) {
      return res.render('signup', { error: 'Zaporka je prekratka' });
    }

    const existingUser = req.db
      .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .get(username, email);

    if (existingUser) {
      return res.render('signup', { error: 'Korisnik već postoji' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = req.db
      .prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
      .run(username, email, hashedPassword);

    req.session.userId = result.lastInsertRowid;
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

router.get('/signin', requireGuest, (req, res) => {
  res.render('signin', { error: null });
});

router.post('/signin', requireGuest, async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.render('signin', { error: 'Unos podataka je obvezan' });
    }

    const user = req.db
      .prepare('SELECT * FROM users WHERE username = ? OR email = ?')
      .get(usernameOrEmail, usernameOrEmail);

    if (!user) {
      return res.render('signin', { error: 'Korisnički podaci nisu točni' });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.render('signin', { error: 'Korisnički podaci nisu točni' });
    }

    req.session.userId = user.id;
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

router.get('/change-username', requireAuth, (req, res) => {
  res.render('change-username', { error: null, success: null });
});

router.post('/change-username', requireAuth, (req, res, next) => {
  try {
    const { newUsername } = req.body;

    // Validacija podataka
    if (!newUsername) {
      return res.render('change-username', {
        error: 'Korisničko ime je obavezno',
        success: null,
      });
    }

    if (newUsername.length < 2) {
      return res.render('change-username', {
        error: 'Korisničko ime je prekratko',
        success: null,
      });
    }

    const existingUser = req.db
      .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
      .get(newUsername, req.session.userId);

    if (existingUser) {
      return res.render('change-username', {
        error: 'Korisničko ime je već u upotrebi',
        success: null,
      });
    }

    req.db
      .prepare('UPDATE users SET username = ? WHERE id = ?')
      .run(newUsername, req.session.userId);

    res.render('change-username', {
      error: null,
      success: 'Korisničko ime je uspješno promijenjeno',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/signout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Session destroy error', error);
    }
    res.redirect('/users/signin');
  });
});

module.exports = router;
