import { Router } from 'express';
import users from './users';
import profile from './profile';
import jobs from './jobs'
import { version } from '../../package.json';

export default ({ config, app }) => {
	const api = Router();

	// mount the resources
	api.use('/users', users({ config, app }));
	api.use('/profile', profile({ config, app }));
	api.use('/jobs', jobs({ config, app }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	// error handler for routes under /api
	// TODO: make it more informative, add error code
	api.use((err, req, res, next) => {
		if (err) {
			return res.status(500).json({
				message: err.message,
			});
		}

		return next();
	});

	return api;
};
