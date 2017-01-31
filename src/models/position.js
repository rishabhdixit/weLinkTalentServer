import Waterline from 'waterline';

const Position = Waterline.Collection.extend({
	identity: 'position',
	connection: 'default',

	attributes: {

		linkedinId: {
			type: 'integer',
		},

		title: {
			type: 'string',
		},

		company: {
			type: 'json',
		},

		location: {
			type: 'json',
		},

		summary: {
			type: 'text',
		},

		isCurrent: {
			type: 'boolean',
		},

		startDate: {
			type: 'json',
		},

		endDate: {
			type: 'json',
		},

		// Parent collection
		profile: {
			model: 'profile',
		},
	},
});

export default Position;
