import { Router } from 'express';
import nodeLinkedin from 'node-linkedin';

/* eslint no-unused-vars: 0 */
export default ({ config, app }) => {
	const routes = Router();
	const linkedin = nodeLinkedin(
		config.linkedin.appid,
		config.linkedin.secret,
		config.linkedin.callback,
	);

	routes.get('/oauth/linkedin', (req, res) => {
		const authUrl = linkedin.auth.authorize(config.linkedin.scope);

		res.send({ url: authUrl });
	});

	routes.get('/oauth/linkedin/callback', (req, res) => {
		linkedin.auth.getAccessToken(res, req.query.code, req.query.state, (err, results) => {
			if (err) {
				throw err;
			}

			const linkedinApi = linkedin.init(results.access_token);

			linkedinApi.people.me([
				'id',
				'email-address',
				'first-name',
				'last-name',
				'headline',
				'specialties',
				'positions',
				'picture-url'],
			(apiErr, $in) => {
				if (apiErr) {
					throw apiErr;
				}

				res.json($in);
			});
		});
	});

	return routes;
};
