import resource from '../lib/resource-router-middleware';

/* eslint no-param-reassign: 1 */
export async function createPosition({ app, profile, body }) {
	if (Array.isArray(body)) {
		const positions = body.map((position) => {
			position.profile = profile.id;
			position.linkedinId = position.id;

			delete position.id;
			return position;
		});

		return app.models.position.create(positions);
	}

	body.profile = profile.id;
	body.linkedinId = body.id;

	delete body.id;
	return app.models.position.create(body);
}

export default ({ app }) => resource({

	mergeParams: true,
	id: 'position',

	/** POST /api/users/{user}/profiles/{profile}/positions - Create a new position entity */
	async create({ params, body }, res) {
		const position = await createPosition({ app, profile: params.profile, body });

		res.json(position);
	},

	/** GET /api/users/{user}/profiles/{profile}/positions/{position} - Get user profile position */
	async read({ params }, res) {
		const position = await app.models.position.findOne({
			id: params.position,
			profile: params.profile,
		});

		res.json(position);
	},
});
