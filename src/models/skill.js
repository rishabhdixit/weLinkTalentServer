import Waterline from 'waterline';

const Skill = Waterline.Collection.extend({
	identity: 'skill',
	connection: 'default',

	attributes: {

		linkedinId: {
			type: 'integer',
		},

		name: {
			type: 'string',
			required: true,
		},

		profile: {
			model: 'profile',
		},
	},
});

export default Skill;
