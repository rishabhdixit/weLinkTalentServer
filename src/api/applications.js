/**
 * Created by rishabhdixit on 26/05/2017.
 */
import _ from 'lodash';
import path from 'path';
import resource from '../lib/resource-router';

export default ({ app }) => resource({
	id: 'application',

	/*
	 POST /api/applications - Create a new job in db
	 */
	async create(req, res) {
		const applicationObj = _.cloneDeep(req.body);
		if (_.get(req, 'file.path')) {
			applicationObj.resume_url = path.join(__dirname, req.file.path);
		}
		const application = await app.models.application.create(applicationObj);
		res.json(application);
	},

});
