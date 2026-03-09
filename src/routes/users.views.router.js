import { Router } from 'express';
import { isAuthenticated, isNotAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas accesibles sólo si el Usuario NO está logueado;
// GET /views/users/login
router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('users/login');
});

// GET /views/users/register
router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('users/register');
});

// Solo accesible si el usuario está logueado;
// GET /views/users/profile
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('users/profile');
});

export default router;