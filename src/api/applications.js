/**
 * Created by rishabhdixit on 26/05/2017.
 */
import _ from 'lodash';
import path from 'path';
import jobsSerivce from '../services/jobsService';
import resource from '../lib/resource-router';

export default ({ app }) => resource({
	id: 'application',

	/*
	 POST /api/applications - Create a new application in db
	 */
	async create(req, res) {
		const applicationObj = _.cloneDeep(req.body);
		if (_.get(req, 'file.path')) {
			applicationObj.resume_url = path.join(__dirname, req.file.path);
		}
		const application = await app.models.application.create(applicationObj);
		res.json(application);
	},

	/*
	 PUT /api/applications/{id} - Update existing application(Add references info)
	 */
	async update({ params, body }, res) {
		app.models.application.update({
			id: params.application,
		}, body, async (err, application) => {
			if (application && application.length) {
				try {
					const jobId = application[0].job_id;
					const jobData = await jobsSerivce.updateJobSlots(app, jobId, params.application);
					res.json(jobData.value);
				} catch (e) {
					res.json({ Error: e });
				}
			}
		});
	},

});