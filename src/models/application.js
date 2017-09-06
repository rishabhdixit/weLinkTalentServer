/**
 * Created by rishabhdixit on 24/05/2017.
 */

import Waterline from 'waterline';
import moment from 'moment';

const Application = Waterline.Collection.extend({
	identity: 'application',
	connection: 'default',
	schema: true,

	attributes: {

		user_id: {
			type: 'string',
			required: true,
		},

		job_id: {
			type: 'string',
			required: true,
		},

		recruiter_id: {
			type: 'string',
			required: true,
		},

		form_status: {
			type: 'string',
			defaultsTo: 'incomplete',
			enum: ['incomplete', 'complete', 'submitted'],
		},

		referee_feedback_requested: {
			type: 'boolean',
			defaultsTo: false,
		},

		recruiter_feedback_requested: {
			type: 'boolean',
			defaultsTo: false,
		},

		feedback: {
			type: 'json',
		},

		form_data: {
			type: 'json',
		},

		references_info: {
			type: 'array',
		},

		resume_urls: {
			type: 'array',
		},

		contacted: {
			type: 'boolean',
			defaultsTo: false,
		},

		recruiter_comment: {
			type: 'string',
		},

		recruiter_reviewed: {
			type: 'boolean',
			defaultsTo: false,
		},

		reference_status: {
			type: 'string',
			enum: ['sent', 'replied', 'approved'],
		},

		application_status: {
			type: 'string',
			enum: ['completed', 'submitted', 'reviewed'],
		},

		approved_by_candidate: {
			type: 'boolean',
			defaultsTo: false,
		},

		applied_by_candidate: {
			type: 'boolean',
			defaultsTo: false,
		},
	},
	beforeValidate(values, cb) {
		if (values.form_data) {
			const form = values.form_data;
			if (!form.reasonForLeaving) {
				return cb('No value for reason for leaving provided');
			}
			if (!form.skills || !form.skills.length) {
				return cb('No skills provided');
			}
		}
		if (values.references_info && values.references_info.length) {
			let errorMsg;
			const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			values.references_info.some((reference) => {
				if (!reference.firstName) {
					errorMsg = 'First name for reference not provided';
					return true;
				}
				if (!reference.lastName) {
					errorMsg = 'Last name for reference not provided';
					return true;
				}
				if (!reference.company) {
					errorMsg = 'Company name of reference not provided';
					return true;
				}
				if (!reference.title) {
					errorMsg = 'Job title of reference not provided';
					return true;
				}
				if (!reference.phone) {
					errorMsg = 'Phone number of reference not provided';
					return true;
				}
				if (!reference.emailAddress) {
					errorMsg = 'Email address of reference not provided';
					return true;
				}
				if (!regex.test(reference.emailAddress)) {
					return cb('Email address of reference is not valid');
				}
				if (!reference.relationship) {
					errorMsg = 'Relationship with reference not provided';
					return true;
				}
				if (!reference.companyTogether) {
					errorMsg = 'Company name where worked together not provided';
					return true;
				}
				if (!reference.startYearOfWorking) {
					errorMsg = 'Start year of working with reference not provided';
					return true;
				} else if (!moment(reference.startYearOfWorking).isValid()) {
					errorMsg = 'Start year of working with reference not valid';
					return true;
				}
				if (!reference.endYearOfWorking) {
					errorMsg = 'End year of working with reference not provided';
					return true;
				} else if (!moment(reference.endYearOfWorking).isValid()) {
					errorMsg = 'End year of working with reference not valid';
					return true;
				}
				if (!reference.canContact) {
					errorMsg = 'Can contact reference not provided';
					return true;
				}
				return false;
			});
			if (errorMsg) {
				return cb(errorMsg);
			}
			return cb();
		}
		cb();
	},
});

export default Application;

