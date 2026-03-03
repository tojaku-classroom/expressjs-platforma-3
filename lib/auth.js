function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/users/signin');
    }
    next();
}

function requireGuest(req, res, next) {
    if (req.session.userId) {
        return res.redirect('/');
    }
    next();
}

function attachUser(req, res, next) {
    if (req.session.userId) {
        const user = req.db
            .prepare('SELECT id, username, email FROM users WHERE id = ?')
            .get(req.session.userId);
        res.locals.user = user;
    } else {
        res.locals.user = null;
    }
    next();
}

module.exports = { requireAuth, requireGuest, attachUser };