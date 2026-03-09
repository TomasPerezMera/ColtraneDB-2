import passport from 'passport';

// Middleware para rutas que requieren autenticación.
export const isAuthenticated = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => {
        if (err) {
        return next(err);
        }
        if (!user) {
        return res.redirect('/login');
        }
        req.user = user;
        next();
    })(req, res, next);
};

// Middleware para rutas que NO deben ser accesibles si el usuario ya está logueado.
export const isNotAuthenticated = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => {
        if (err) {
        return next(err);
        }
        if (user) {
        return res.redirect('/products');
        }
        next();
    })(req, res, next);
};