import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../utils/jwt.utils.js';

const router = Router();

// Inicio de autenticación con GitHub.
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false  }));

// Callback de GitHub.
router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // TODO: JWT y guardar en cookies; por ahora, redirect temporal.
        res.redirect('/profile');
    }
);


// POST /api/sessions/register
router.post('/register',
    passport.authenticate('register', { session: false, failureRedirect: '/register' }),
    (req, res) => {
    const token = generateToken(req.user);
    res.cookie('currentUser', token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        signed: true
    });
    res.redirect('/views/commerce/product-catalog');
    }
);


// POST /api/sessions/login
router.post('/login',
    passport.authenticate('login', { session: false, failureRedirect: '/login' }),
    (req, res) => {
    const token = generateToken(req.user);
    res.cookie('currentUser', token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        signed: true
    });
    res.redirect('/views/commerce/product-catalog');
    }
);


// GET /api/sessions/github
router.get('/github',
    passport.authenticate('github', { scope: ['user:email'], session: false })
);


// GET /api/sessions/github/callback
router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    (req, res) => {
    const token = generateToken(req.user);
    res.cookie('currentUser', token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        signed: true
    });
    res.redirect('/views/commerce/product-catalog');
    }
);


// GET /api/sessions/current
router.get('/current',
    passport.authenticate('current', { session: false }),
    (req, res) => {
    res.json({
        status: 'success',
        user: {
        id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        role: req.user.role
        }
    });
    }
);

// POST /api/sessions/logout
router.post('/logout', (req, res) => {
    res.clearCookie('currentUser');
    res.redirect('/login');
});

export default router;