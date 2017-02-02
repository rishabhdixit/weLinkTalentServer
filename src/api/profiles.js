import bluebird from 'bluebird';
import resource from '../lib/resource-router-middleware';
import { createPosition } from './positions';

/* eslint no-param-reassign: 1 */
export async function createProfile({ app, user, body }) {
	const profileData = { ...body, user: user.id };
	const profile = await app.models.profile.create(profileData);

	await createPosition({ app, profile, body: body.positions });

	return profile;
}

export default ({ app }) => resource({

	mergeParams: true,
	id: 'profile',

	/** GET /api/users/{user}/profiles - Returns full profile data of user based on parameter user */
	async index({ params }, res) {
		const user = await app.models.user.findOne(params.user);
		const profile = await app.models.profile.findOne({ id: user.profile, user: params.user })
			.populate('positions')
			.populate('skills');

		res.json(profile);
	},

	/** POST /api/users/{user}/profile - Create user profile with skills and positions*/
	async create({ params, body }, res) {
		const profile = await createProfile({ app, user: params.user, body });

		await app.models.user.update(params.user, { profile: profile.id });

		res.json();
	},

	/** GET /api/users/{user}/profiles/{profile} - Get full profile entity by profile id*/
	async read({ params }, res) {
		const profile = await app.models.profile.findOne({ id: params.profile, user: params.user })
			.populate('positions')
			.populate('skills');

		res.json(profile);
	},

	/** PUT /api/users/{user}/profiles/{profile} - Get full profile entity by profile id*/
	async update({ params, body }, res) {
		const profile = await app.models.profile.update(params.profile, body);

		res.json(profile[0]);
	},

	/** DELETE /api/users/{user}/profiles/{profile} - Delete a profile entity by profile id */
	async delete({ params }, res) {
		const [user, profile, positions] = await bluebird.all([
			app.models.user.update(params.user, { profile: null }),
			app.models.profile.destroy({ id: params.profile, user: params.user }),
			app.models.position.destroy({ profile: params.profile }),
		]);

		res.json({ user, profile, positions });
	},
});
