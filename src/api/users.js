import resource from '../lib/resource-router-middleware';

export default ({ app }) => resource({

	/** POST /api/users - Create a new entity */
	async create({ body }, res) {
		const user = await app.models.user.create(body);

		res.json(user);
	},

});
