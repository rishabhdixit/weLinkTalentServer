import Waterline from 'waterline';

const Profile = Waterline.Collection.extend({
	identity: 'profile',
	connection: 'default',
	schema: true,

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
			type: 'array',
		},

		workExperiences: {
			type: 'array',
		},

		skills: {
			type: 'array',
		},

		birthDate: {
			type: 'string',
		},

		NRIC: {
			type: 'string',
		},

		singaporeVisa: {
			type: 'string',
		},

		visaValidity: {
			type: 'string',
		},

		noticePeriod: {
			type: 'string',
		},

		noticePeriodNegotiable: {
			type: 'boolean',
		},

		maritalStatus: {
			type: 'string',
		},

		mobileNumber: {
			type: 'string',
		},

		currentSalary: {
			type: 'json',
		},

		expectedSalary: {
			type: 'json',
		},

		miscellaneous: {
			type: 'json',
		},

		toJSON() {
			const obj = this.toObject();

			delete obj.createdAt;
			delete obj.updatedAt;
			delete obj.user;

			return obj;
		},
	},

	afterValidate(values, cb) {
		if (values.NRIC && (!Number(values.NRIC) || Number(values.NRIC) < 0)) {
			return cb('NRIC is not valid');
		}
		if (values.mobileNumber && !Number(values.mobileNumber)) {
			return cb('Mobile number is not valid');
		}
		cb();
	},
});

export default Profile;
