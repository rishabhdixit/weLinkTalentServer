/**
 * Created by rishabhdixit on 07/08/2017.
 */

import Waterline from 'waterline';

const Token = Waterline.Collection.extend({
	identity: 'token',
	connection: 'default',
	schema: true,

	attributes: {
		applicationId: {
			type: 'string',
			required: true,
		},

		emailAddress: {
			type: 'string',
			required: true,
		},

		token: {
			type: 'string',
			required: true,
		},

		expired: {
			type: 'boolean',
			defaultsTo: false,
		},

	},
});

export default Token;

