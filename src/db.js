import Waterline from 'waterline';
import config from '../config';

// Models
import User from './models/user';
import Profile from './models/profile';
import Job from './models/job';
import Application from './models/application';
import Token from './models/token';

export default (callback) => {
	const orm = new Waterline();

	orm.loadCollection(User);
	orm.loadCollection(Profile);
	orm.loadCollection(Job);
	orm.loadCollection(Application);
	orm.loadCollection(Token);
	orm.initialize(config.db, (err, db) => {
		if (err) {
			console.log('Error while connecting to the db: ', err);
			throw err;
		}
		console.log('successfully connected to the db ');
		callback(db);
	});
};
