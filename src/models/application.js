/**
 * Created by rishabhdixit on 24/05/2017.
 */

import Waterline from 'waterline';

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

		form_status: {
			type: 'string',
			defaultsTo: 'incomplete',
			enum: ['incomplete', 'complete', 'submitted'],
		},

		validation_status: {
			type: 'string',
			defaultsTo: 'incomplete',
			enum: ['incomplete', 'complete', 'submitted'],
		},

		submission_status: {
			type: 'string',
			defaultsTo: 'incomplete',
			enum: ['incomplete', 'complete', 'submitted'],
		},

		acceptance_status: {
			type: 'string',
			defaultsTo: 'pending',
			enum: ['pending', 'rejected', 'accepted'],
		},

		feedback_requested: {
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
	},
});

export default Application;

