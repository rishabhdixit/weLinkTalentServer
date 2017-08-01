/**
 * Created by rishabhdixit on 23/05/2017.
 */

import Waterline from 'waterline';

const Job = Waterline.Collection.extend({
	identity: 'job',
	connection: 'default',

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
		},

		job_type: {
			type: 'string',
		},

		company_name: {
			type: 'string',
		},

		company_logo: {
			type: 'string',
			required: true,
		},

		company: {
			type: 'json',
		},

		responsibilities: {
			type: 'array',
		},

		ideal_talent: {
			type: 'array',
		},

		skills: {
			type: 'array',
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
		},

		location: {
			type: 'string',
		},

		visa_passport_constraints: {
			type: 'string',
		},

		salary_from: {
			type: 'float',
		},

		salary_to: {
			type: 'float',
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
		},

		expertise: {
			type: 'string',
		},

		salary_currency: {
			type: 'string',
		},

		application_slots: {
			type: 'integer',
		},

		remaining_slots: {
			type: 'integer',
		},

		applications_waiting: {
			type: 'array',
			defaultsTo: [],
		},

		archived: {
			type: 'boolean',
			defaultsTo: false,
		},
	},
});

export default Job;
