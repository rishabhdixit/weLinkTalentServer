import Waterline from 'waterline';
import config from '../config';

// Models
import User from './models/users';

export default (callback) => {
	const orm = new Waterline();

	orm.loadCollection(User);
	orm.initialize(config.db, (err, db) => {
		if (err) {
			throw err;
		}

		callback(db);
	});
};
