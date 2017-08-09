import Waterline from 'waterline';
import config from '../config';

// Models
import User from './models/user';
import Profile from './models/profile';
import Skill from './models/skill';
import Position from './models/position';
import Job from './models/job';
import Application from './models/application';
import Token from './models/token';

export default (callback) => {
	const orm = new Waterline();

	orm.loadCollection(User);
	orm.loadCollection(Profile);
	orm.loadCollection(Skill);
	orm.loadCollection(Position);
	orm.loadCollection(Job);
	orm.loadCollection(Application);
	orm.loadCollection(Token);
	orm.initialize(config.db, (err, db) => {
		if (err) {
			throw err;
		}

		callback(db);
	});
};
