import resource from '../lib/resource-router';

export default ({ app }) => resource({

	mergeParams: true,
	id: 'profile',

	/** GET /api/users/{user}/profiles - Returns full profile data of user based on parameter user */
	async index({ params }, res) {
		const user = await app.models.user.findOne(params.user);
		const profile = await app.models.profile.findOne({ id: user.profile, user: params.user });

		res.json(profile);
	},

	/** POST /api/users/{user}/profiles - Create user profile with skills and positions */
	async create({ params, body }, res) {
		const profileData = { ...body, user: params.user };
		const profile = await app.models.profile.create(profileData);

		res.json(profile);
	},

	/** GET /api/users/{user}/profiles/{profile} - Get full profile entity by profile id */
	async read({ params }, res) {
		const profile = await app.models.profile.findOne({ id: params.profile, user: params.user });

		res.json(profile);
	},

	/** PUT /api/users/{user}/profiles/{profile} - Get full profile entity by profile id */
	async update({ params, body }, res) {
		const profile = await app.models.profile.update(params.profile, body);

		res.json(profile[0]);
	},

	/** DELETE /api/users/{user}/profiles/{profile} - Delete a profile entity by profile id */
	async del({ params }, res) {
		const [user, profile] = await Promise.all([
			app.models.user.update(params.user, { profile: null }),
			app.models.profile.destroy({ id: params.profile, user: params.user }),
		]);

		res.json({ user: user[0], profile: profile[0] });
	},
});
