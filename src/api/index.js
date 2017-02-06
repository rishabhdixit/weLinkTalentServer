import { Router } from 'express';
import users from './users';
import profiles from './profiles';
import jobs from './jobs';
import positions from './positions';
import skills from './skills';
import { version } from '../../package.json';

export default ({ config, app }) => {
	const api = Router();

	// mount the resources
	const userApi = users({ config, app });
	const profileApi = profiles({ config, app });

	// Generate /api/users/:id/profile route
	userApi.use('/:user/profiles', profileApi);

	// Generate profile child routes
	profileApi.use('/:profile/positions', positions({ config, app }));
	profileApi.use('/:profile/skills', skills({ config, app }));

	api.use('/users', userApi);
	api.use('/jobs', jobs({ config, app }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	// error handler for routes under /api
	api.use((err, req, res, next) => {
		if (err) {
			return res.status(500).json({
				error: err.message,
			});
		}

		return next();
	});

	return api;
};
