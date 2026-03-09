import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import jwt from 'passport-jwt';
import User from '../models/user.model.js';
import { createHash, isValidPassword } from '../utils/utils.js';

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;


// Extractor personalizado para cookies.
const cookieExtractor = req => {
    let token = null;
    if (req && req.signedCookies) {
    token = req.signedCookies['currentUser'];
    }
    return token;
};

// Inicializamos Passport y definimos las Estrategias de Login.
const initializePassport = () => {

  // Estrategia REGISTER:
    passport.use('register', new LocalStrategy(
    { passReqToCallback: true, usernameField: 'email' },
    async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return done(null, false, { message: 'User already exists' });
            }

        const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            role: email === 'adminCoder@coder.com' ? 'admin' : 'user'
        };

        const result = await User.create(newUser);
        return done(null, result);
        } catch (error) {
        return done(error);
        }
    }
));


// Estrategia LOGIN:
passport.use('login', new LocalStrategy(
    { usernameField: 'email' },
    async (username, password, done) => {
        try {
        const user = await User.findOne({ email: username });
        if (!user) {
            return done(null, false, { message: 'User not found' });
        }

        if (!isValidPassword(user, password)) {
            return done(null, false, { message: 'Invalid password' });
        }

        return done(null, user);
        } catch (error) {
        return done(error);
        }
    }
    ));

// Estrategia GITHUB:
passport.use('github', new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile._json.email || `${profile.username}@github.com`;
        let user = await User.findOne({ email });

        if (!user) {
        const newUser = {
            first_name: profile._json.name || profile.username,
            last_name: '',
            email,
            age: 0,
            password: '',
            role: 'user'
        };
        user = await User.create(newUser);
        }
        return done(null, user);
    } catch (error) {
        return done(error);
        }
    }
));


// Estrategia CURRENT (con JWT):
passport.use('current', new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
    secretOrKey: process.env.JWT_SECRET
    },
    async (jwt_payload, done) => {
    try {
    const user = await User.findById(jwt_payload.id);
    if (!user) {
        return done(null, false);
    }
    return done(null, user);
    } catch (error) {
    return done(error);
        }
    }
));

};

export default initializePassport;