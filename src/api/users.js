import resource from '../lib/resource-router';

export default ({ app }) => resource({
	id: 'user',

	/** GET /api/users - Returns user data of user based on jwt token */
	async index({ tokenPayload }, res) {
		res.json(await app.models.user.findOne(tokenPayload.id));
	},

	/** POST /api/users - Create a new entity */
	async create({ body }, res) {
		res.json(await app.models.user.create(body));
	},

	/** GET /api/users/{user} - Get user basic profile by id */
	async read({ params }, res) {
		res.json(await app.models.user.findOne(params.user).populate('profile'));
	},
});
