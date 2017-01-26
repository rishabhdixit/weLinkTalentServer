import Waterline from 'waterline';
import bcrypt from 'bcrypt';
import config from '../../config';

const User = Waterline.Collection.extend({
	identity: 'user',
	connection: 'default',

	attributes: {

		email: {
			type: 'string',
			required: true,
		},

		password: {
			type: 'string',
			minLength: 6,
			required: true,
		},
	},

	beforeCreate(values, next) {
		/* eslint consistent-return: 0, no-param-reassign: 0 */
		bcrypt.genSalt(config.bcrypt.rounds, (saltErr, salt) => {
			if (saltErr) return next(saltErr);

			bcrypt.hash(values.password, salt, (hashErr, hash) => {
				if (hashErr) return next(hashErr);

				values.password = hash;
				next();
			});
		});
	},
});

export default User;
