/**
 * Created by rishabhdixit on 23/05/2017.
 */

import Waterline from 'waterline';
import * as _ from 'lodash';

const Job = Waterline.Collection.extend({
	identity: 'job',
	connection: 'default',
	schema: true,

	attributes: {

		employer_id: {
			type: 'string',
			required: true,
		},

		description: {
			type: 'string',
		},

		employment_type: {
			type: 'string',
			required: true,
		},

		job_type: {
			type: 'string',
			required: true,
		},

		company_name: {
			type: 'string',
			required: true,
		},

		company_logo: {
			type: 'string',
			required: true,
		},

		company: {
			type: 'json',
			required: true,
		},

		responsibilities: {
			type: 'array',
			required: true,
		},

		ideal_talent: {
			type: 'array',
			required: true,
		},

		skills: {
			type: 'array',
			required: true,
		},

		criteria: {
			type: 'array',
		},

		questions: {
			type: 'array',
		},

		title: {
			type: 'string',
			required: true,
		},

		years_experience: {
			type: 'float',
			required: true,
			min: 0,
		},

		location: {
			type: 'string',
		},

		visa_passport_constraints: {
			type: 'string',
		},

		salary_from: {
			type: 'float',
			required: true,
			min: 0,
		},

		salary_to: {
			type: 'float',
			required: true,
			min: 0,
		},

		contact_name: {
			type: 'string',
		},

		contact_number: {
			type: 'string',
		},

		contact_email: {
			type: 'string',
		},

		industry: {
			type: 'string',
			required: true,
		},

		expertise: {
			type: 'string',
			required: true,
		},

		salary_currency: {
			type: 'string',
			required: true,
		},

		application_slots: {
			type: 'integer',
			required: true,
			min: 0,
		},

		remaining_slots: {
			type: 'integer',
			min: 0,
		},

		applications_waiting: {
			type: 'array',
			defaultsTo: [],
		},

		archived: {
			type: 'boolean',
			defaultsTo: false,
		},

		salary_negotiable: {
			type: 'boolean',
			defaultsTo: false,
		},
	},

	afterValidate(values, cb) {
		if (values.company) {
			const company = values.company;
			if (!company.name) {
				return cb('No company name provided');
			} else if (!_.isString(company.name)) {
				return cb('Company name has to be of type string');
			}
			if (!company.address) {
				return cb('No company address provided');
			} else if (!_.isString(company.address)) {
				return cb('Company address has to be of type string');
			}
			if (!company.about) {
				return cb('No about company provided');
			} else if (!_.isString(company.about)) {
				return cb('About company has to be of type string');
			}
			if (!company.email) {
				return cb('No company name provided');
			}
			const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (!regex.test(company.email)) {
				return cb('Company email is not valid');
			}

			if (!company.phone_numbers) {
				return cb('No company phone number provided');
			} else if (!_.isArray(company.phone_numbers) || !(company.phone_numbers.length)) {
				return cb('Company phone numbers must be an array');
			}
			let errorMsg;
			company.phone_numbers.some((phoneNumber) => {
				if (!Number(phoneNumber)) {
					errorMsg = 'Company Phone numbers are not valid';
					return true;
				}
				return false;
			});
			if (errorMsg) {
				return cb(errorMsg);
			}
			cb();
		}
	},
});

export default Job;
