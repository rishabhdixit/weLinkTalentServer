import Waterline from 'waterline';
import config from '../config';

// Models
import User from './models/users';
import Profile from './models/profile';

export default (callback) => {
	const orm = new Waterline();

	orm.loadCollection(User);
	orm.loadCollection(Profile);
	orm.initialize(config.db, (err, db) => {
		if (err) {
			throw err;
		}

		callback(db);
	});
};
