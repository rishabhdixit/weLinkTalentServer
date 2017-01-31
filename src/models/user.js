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
			unique: true,
			index: true,
		},

		password: {
			type: 'string',
			minLength: 6,
		},

		profile: {
			model: 'profile',
		},

		toJSON() {
			const obj = this.toObject();
			delete obj.password;
			return obj;
		},
	},

	beforeCreate(values, next) {
		if (values.password) {
			/* eslint consistent-return: 0, no-param-reassign: 0 */
			bcrypt.genSalt(config.bcrypt.rounds, (saltErr, salt) => {
				if (saltErr) return next(saltErr);

				bcrypt.hash(values.password, salt, (hashErr, hash) => {
					if (hashErr) return next(hashErr);

					values.password = hash;
					next();
				});
			});
		} else {
			next();
		}
	},
});

export default User;
