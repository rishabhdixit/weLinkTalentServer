import Waterline from 'waterline';

const Profile = Waterline.Collection.extend({
	identity: 'profile',
	connection: 'default',

	attributes: {

		linkedinId: {
			type: 'string',
		},

		emailAddress: {
			type: 'string',
			unique: true,
			index: true,
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

		summary: {
			type: 'string',
		},

		user: {
			model: 'user',
		},

		positions: {
			collection: 'position',
			via: 'profile',
		},

		skills: {
			collection: 'skill',
			via: 'profile',
		},

		toJSON() {
			const obj = this.toObject();

			delete obj.createdAt;
			delete obj.updatedAt;
			delete obj.user;

			return obj;
		},
	},
});

export default Profile;
