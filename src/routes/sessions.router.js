import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../utils/jwt.utils.js';
import UserRepository from '../repositories/user.repository.js';

const router = Router();

// Inicio de autenticación con GitHub.
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false  }));

// Callback de GitHub.
router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = generateToken(req.user);
        res.cookie('currentUser', token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            signed: true
        });
    res.redirect('/products');
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
    res.redirect('/products');
    }
);


// POST /api/sessions/login
router.post('/login', (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Login error:', err);
            return res.redirect('/login?error=server');
        }
        if (!user) {
            console.log('Login failed:', info?.message || 'Unknown reason');
            return res.redirect('/login?error=credentials');
        }
        const token = generateToken(user);
        res.cookie('currentUser', token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            signed: true
        });
        res.redirect('/products');
    })(req, res, next);
});


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
    res.redirect('/products');
    }
);


// GET /api/sessions/current
router.get('/current',
    passport.authenticate('current', { session: false }),
    async (req, res) => {
        try {
            const userDTO = await UserRepository.getUserById(req.user.id);
            res.json({
                status: 'success',
                user: userDTO
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

// POST /api/sessions/logout
router.post('/logout', (req, res) => {
    res.clearCookie('currentUser');
    res.redirect('/products');
});

export default router;