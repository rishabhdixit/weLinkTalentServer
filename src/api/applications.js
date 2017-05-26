/**
 * Created by rishabhdixit on 26/05/2017.
 */
import resource from '../lib/resource-router';
import _ from 'lodash';

export default ({ app }) => resource({
	id: 'application',

	/*
	 POST /api/applications - Create a new job in db
	 */
	async create(req, res) {
		let applicationObj = _.cloneDeep(req.body);
		if (_.get(req, req.file.path)) {
			applicationObj.resume_url = __dirname + req.file.path;
		}
		const application = await app.models.application.create(applicationObj);
		res.json(application);
	},

});
