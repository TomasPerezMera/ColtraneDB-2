import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Inicio de autenticación con GitHub.
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Callback de GitHub.
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/views/users/login' }),
    (req, res) => {
        // TODO: JWT y guardar en cookies; por ahora, redirect temporal.
        res.redirect('/views/users/profile');
    }
);

export default router;