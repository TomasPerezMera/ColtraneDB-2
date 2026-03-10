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

// Middleware que carga el usuario si existe, pero NO bloquea navegación si no existe.
export const loadUser = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => {
    if (user) {
        req.user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            age: user.age
        };
    }
    next();
    })(req, res, next);
};