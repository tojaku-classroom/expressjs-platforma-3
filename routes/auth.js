const express = require('express');
const router = express.Router;
const bcrypt = require('bcrypt');
const { requireGuest } = require('../lib/auth');

router.get('/signup', requireGuest, (req, res) => {
    res.render('signup', { error: null });
});

router.post('/signup', requireGuest, async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.render('signup', { error: "Unos podataka je obvezan" });
        }

        if (password.length < 6) {
            return res.render('signup', { error: "Zaporka je prekratka" });
        }

        const existingUser = req.db
            .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
            .get(username, email);

        if (existingUser) {
            return res.render('signup', { error: "Korisnik već postoji" });
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
        const { username, password } = req.body;

        if (!username || !password) {
            return res.render('signin', { error: "Unos podataka je obvezan" });
        }

        const user = req.db
            .prepare('SELECT * FROM users WHERE username = ? OR email = ?')
            .get(username, username);

        if (!user) {
            return res.render('signin', { error: "Korisnički podaci nisu točni" });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.render('signin', { error: "Korisnički podaci nisu točni" });
        }

        req.session.userId = user.id;
        res.redirect('/');
    } catch (error) {
        next(error);
    }
});