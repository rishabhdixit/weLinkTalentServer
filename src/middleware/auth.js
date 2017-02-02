import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import ejwt from 'express-jwt';
import unless from 'express-unless';

import { Router } from 'express';
import { Strategy } from 'passport-local';

import { UnauthorizedError, InternalServerError } from '../lib/errors';
import { createProfile } from '../api/profiles';

/* eslint no-unused-vars: 0 */
export default ({ config, app }) => {
	const routes = Router();

	// Authenticate using email, password fields in POST body
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

	routes.use(passport.initialize());
	routes.use(ejwt({ secret: config.jwt.secret, userProperty: 'tokenPayload' })
			.unless({ path: config.excludedRoutes }));

	// Authenticate endpoint using email and password
	routes.post('/authenticate', (req, res, next) => {
		passport.authenticate('local', (err, user, info) => {
			if (err) {
				return next(new InternalServerError(err));
			}

			if (!user) {
				return res.status(401).json({ status: 'error', code: 'unauthorized' });
			}

			const token = jwt.sign({ id: user.id, email: user.email }, config.jwt.secret);

			return res.json({ token });
		})(req, res, next);
	});

	// Saves profile returned from linkedin and generates
	// user token for the user
	routes.post('/authenticate/linkedin', async ({ body }, res, next) => {
		// we're using try catch here since express routes doesn't
		// support async functions and does not catch errors
		try {
			let user = await app.models.user.findOne({ email: body.emailAddress });
			let profile;

			if (!user) {
				user = await app.models.user.create({ email: body.emailAddress });
			}

			if (!user.profile) {
				profile = await createProfile({ app, user, body });
				user = await app.models.user.update(user.id, { profile: profile.id });
				user = user[0];
			}

			profile = await app.models.profile.findOne(user.profile)
					.populate('positions')
					.populate('skills');

			const token = jwt.sign({ id: user.id, email: user.email }, config.jwt.secret);

			res.json({ token, profile });
		} catch (error) {
			next(new InternalServerError(error));
		}
	});

	// Auth middleware error handler
	routes.use((err, req, res, next) => {
		if (err.name === 'UnauthorizedError') {
			return res.status(err.status).json({
				message: err.message,
			});
		} else if (err.name === 'InternalServerError') {
			return res.status(err.status).json({
				message: err.message,
			});
		}

		return res.status(400).json({
			message: `Something went wrong. ${err.message}`,
		});
	});

	return routes;
};
