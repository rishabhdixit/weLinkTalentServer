import Waterline from 'waterline';

const Profile = Waterline.Collection.extend({
	identity: 'profile',
	connection: 'default',

	attributes: {

		linkedinId: {
			type: 'string',
			unique: true,
			index: true,
		},

		emailAddress: {
			type: 'string',
			unique: true,
		},

		firstName: {
			type: 'string',
		},

		lastName: {
			type: 'string',
		},

		pictureUrl: {
			type: 'string',
		},

		headline: {
			type: 'string',
		},

		positions: {
			type: 'array',
		},

		user: {
			model: 'user',
		},
	},
});

export default Profile;
