import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import ejwt from 'express-jwt';

import { Router } from 'express';
import { Strategy } from 'passport-local';

import User from '../models/users';

import { UnauthorizedError } from '../lib/errors';

/* eslint no-unused-vars: 0 */
export default ({ config, app }) => {
	const api = Router();

	// Authenticate using email, password fields in POST body
	// TODO: Query DB if user is registered
	passport.use(new Strategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true,
		session: false,
	},
	async (req, email, password, cb) => {
		const user = await app.models.user.findOne({ email });

		if (!user) {
			return cb(new UnauthorizedError('User not found.'));
		}

		const passwordIsCorrect = await bcrypt.compare(password, user.password);

		if (!passwordIsCorrect) {
			return cb(new UnauthorizedError('Incorrect password.'));
		}

		return cb(null, user);
	}));

	api.use(passport.initialize());
	api.use(ejwt({ secret: config.jwt.secret, userProperty: 'tokenPayload' })
			.unless({ path: ['/authenticate', { url: '/api/users', methods: ['POST'] }] }));

	// Authenticate endpoint for logging in users
	api.post('/authenticate', (req, res, next) => {
		passport.authenticate('local', (err, user, info) => {
			if (err) {
				return next(err);
			}

			if (!user) {
				return res.status(401).json({ status: 'error', code: 'unauthorized' });
			}

			return res.json({ token: jwt.sign(user, config.jwt.secret) });
		})(req, res, next);
	});

	// TODO: Load user from database if token is found
	api.use((req, res, next) => {
		if (req.tokenPayload || req.body.email) {
			return next();
		}

		return next(new UnauthorizedError('Token payload not found.'));
	});

	// Auth middleware error handler
	api.use((err, req, res, next) => {
		if (err.name === 'UnauthorizedError') {
			return res.status(401).json({
				message: err.message,
			});
		}

		return next();
	});

	return api;
};
