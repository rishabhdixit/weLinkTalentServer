import Waterline from 'waterline';
import moment from 'moment';

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

		noticePeriodNegotioble: {
			type: 'boolean',
		},

		maritalStatus: {
			type: 'string',
		},

		mobileNumber: {
			type: 'string',
		},

		noOfChildren: {
			type: 'integer',
			min: 0,
		},

		salaryPerMonth: {
			type: 'float',
			min: 0,
		},

		salaryBasis: {
			type: 'string',
		},

		bonusAmount: {
			type: 'float',
			min: 0,
		},

		bonusCalc: {
			type: 'string',
		},

		allowance: {
			type: 'float',
			min: 0,
		},

		allowanceDesc: {
			type: 'string',
		},

		incentives: {
			type: 'string',
		},

		vestingPeriod: {
			type: 'string',
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
		if (values.visaValidity && !moment(values.visaValidity).isValid()) {
			return cb('Visa validitity is not a proper date');
		}
		if (values.noticePeriod && !moment(values.noticePeriod).isValid()) {
			return cb('Notice period is not a proper date');
		}
		if (values.mobileNumber && !Number(values.mobileNumber)) {
			return cb('Mobile number is not valid');
		}
		if (values.vestingPeriod && !moment(values.vestingPeriod).isValid()) {
			return cb('Visa validitity is not a proper date');
		}
		cb();
	},
});

export default Profile;
