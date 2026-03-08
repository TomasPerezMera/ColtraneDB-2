import { Router } from 'express';

const router = Router();

// GET /views/users/login
router.get('/login', (req, res) => {
    res.render('users/login');
});

// GET /views/users/register
router.get('/register', (req, res) => {
    res.render('users/register');
});

// GET /views/users/profile
router.get('/profile', (req, res) => {
    res.render('users/profile');
});

export default router;