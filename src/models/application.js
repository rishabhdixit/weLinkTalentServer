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
});

export default Application;

