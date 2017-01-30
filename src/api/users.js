import resource from '../lib/resource-router-middleware';

export default ({ app }) => resource({

	/** POST /api/users - Create a new entity */
	async create({ body }, res) {
		res.json(await app.models.user.create(body));
	},

	/** GET /api/users/{id} - Get user basic profile */
	async read({ params }, res) {
		res.json(await app.models.user.findOne(params.id).populate('profile'));
	},
});
