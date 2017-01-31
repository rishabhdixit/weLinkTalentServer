import bluebird from 'bluebird';
import resource from '../lib/resource-router-middleware';
import { createPosition } from './positions';

/* eslint no-param-reassign: 1 */
export async function createProfile({ app, user, body }) {
	// delete linkedin generated id and let db generate id
	const linkedinId = body.id;
	delete body.id;

	const profileData = { ...body, user: user.id, linkedinId };
	const profile = await app.models.profile.create(profileData);

	await createPosition({ app, profile, body: body.positions });

	return profile;
}

export default ({ app }) => resource({

	mergeParams: true,
	id: 'profile',

	/** POST /api/users/{user}/profile - Create user profile with skills and positions*/
	async create({ params, body }, res) {
		const profile = await createProfile({ app, user: params.user, body });

		await app.models.user.update(params.user, { profile: profile.id });

		res.json();
	},

	/** GET /api/users/{user}/profiles/{profile} - Get profile entity by profile id*/
	async read({ params }, res) {
		res.json(await app.models.profile.findOne(params.profile).populate('positions'));
	},

	/** Delete /api/users/{user}/profiles/{profile} - Delete a profile entity by profile id */
	async delete({ params }, res) {
		const [user, profile, positions] = await bluebird.all([
			app.models.user.update(params.user, { profile: null }),
			app.models.profile.destroy({ id: params.profile, user: params.user }),
			app.models.position.destroy({ profile: params.profile }),
		]);

		res.json({ user, profile, positions });
	},
});
