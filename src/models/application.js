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
			if (!values.form_data.reasonForLeaving) {
				return cb('No value for reason for leaving provided');
			}
			if (!values.form_data.basePerMonth) {
				return cb('No value for base per month provided');
			} else if (!parseInt(values.form_data.basePerMonth, 10)
				|| parseInt(values.form_data.basePerMonth, 10) < 0) {
				return cb('Please provide valid number for base per month');
			}
			if (!values.form_data.bonus) {
				return cb('No value for bonus provided');
			} else if (!parseInt(values.form_data.bonus, 10)
				|| parseInt(values.form_data.bonus, 10) < 0) {
				return cb('Please provide valid number for bonus');
			}
			if (!values.form_data.skills || !values.form_data.skills.length) {
				return cb('No skills provided');
			}
			if (!values.form_data.strength) {
				return cb('No value for strength provided');
			}
			if (!values.form_data.improvements) {
				return cb('No value for improvements provided');
			}
			if (!values.form_data.achievements) {
				return cb('No value for management provided');
			}
			if (!values.form_data.management) {
				return cb('No value for management provided');
			}
		}
		if (values.references_info && values.references_info.length) {
			let errorMsg;
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

