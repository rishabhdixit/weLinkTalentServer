import resource from '../lib/resource-router';

export async function createSkill({ app, profile, body }) {
	/* eslint no-param-reassign: 1 */
	if (Array.isArray(body)) {
		const skills = body.map((skill) => {
			skill.profile = profile.id;
			skill.linkedinId = skill.id;

			delete skill.id;
			return skill;
		});

		return app.models.skill.create(skills);
	}

	body.profile = profile.id;
	body.linkedinId = body.id;

	delete body.id;
	return app.models.skill.create(body);
}

export default ({ app }) => resource({

	mergeParams: true,
	id: 'skill',

	/** POST /api/users/{user}/profiles/{profile}/skills - Creates a skill */
	async create({ params, body }, res) {
		const skill = await createSkill({ app, profile: { id: params.profile }, body });

		res.json(skill);
	},
});
