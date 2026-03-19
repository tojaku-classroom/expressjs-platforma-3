const express = require('express');
const router = express.Router();
const { requireAuth } = require('../lib/auth');

router.use(requireAuth); // Sve rute unutar ovog rutera trebaju autentifikaciju

// Prikaz i dodavanje zadataka
router.get('/', (req, res) => {
  const tasks = req.db
    .prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.session.userId);
  res.render('tasks', { tasks: tasks, error: null });
});

router.post('/', (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      const tasks = req.db
        .prepare(
          'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC'
        )
        .all(req.session.userId);

      return res.render('tasks', { tasks: tasks, error: 'Naslov je obavezan' });
    }

    req.db
      .prepare(
        'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)'
      )
      .run(req.session.userId, title, description || '');

    res.redirect('/tasks');
  } catch (error) {
    next(error);
  }
});

// Promjena zadatka
router.get('/:id/edit', (req, res) => {
  const task = req.db
    .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.session.userId);
  if (!task) return res.redirect('/tasks');
  res.render('task-edit', { task: task, error: null });
});

router.post('/:id/edit', (req, res) => {
  const { title, description } = req.body;

  const task = req.db
    .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.session.userId);

  if (!task) return res.redirect('/tasks');

  if (!title) {
    return res.render('task-edit', { task: task, error: 'Naslov je obavezan' });
  }

  req.db
    .prepare(
      'UPDATE tasks SET title = ?, description = ? WHERE id = ? AND user_id = ?'
    )
    .run(title, description || '', req.params.id, req.session.userId);
  res.redirect('/tasks');
});

// Označavanje statusa zadatka
router.post('/:id/toggle', (req, res) => {
  req.db
    .prepare('UPDATE tasks SET done = NOT done WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.session.userId);
  res.redirect('/tasks');
});

// Brisanje zadatka
router.post('/:id/delete', (req, res) => {
  req.db
    .prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.session.userId);
  res.redirect('/tasks');
});

module.exports = router;
