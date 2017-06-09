/**
 * Created by rishabhdixit on 26/05/2017.
 */
import _ from 'lodash';
import path from 'path';
import jobsSerivce from '../services/jobsService';
import resource from '../lib/resource-router';
import config from '../../config/index';

export default ({ app }) => resource({
	id: 'application',

	/*
    GET /api/applications - Fetching applications at max 10 per request
     */
	async index({ params, query }, res) {
		const searhQuery = {
			user_id: query.userId,
		};
		if (query.jobId) {		// returning application status of a specific job by a user
			searhQuery.job_id = query.jobId;
			const application = await app.models.application.findOne(searhQuery);
			res.json({ status: application.form_status });
		} else {		// returning all applications of a user
			const limit = config.pageLimit;
			const page = parseInt(query.page || 1, 10);
			const skip = limit * (page - 1);
			res.json(await app.models.application.find(searhQuery)).skip(skip).limit(limit);
		}
	},

	/*
    GET /api/applications - Fetching jobs at max 10 per request
     */
	async index({ params, query }, res) {
		const userId = query.user_id;
		const jobId = query.job_id;
		const application = await app.models.application.findOne({ user_id: userId, job_id: jobId });
		res.json({ status: application.form_status });
	},

	/*
	 POST /api/applications - Create a new application in db
	 */
	async create(req, res) {
		const applicationObj = {};
		applicationObj.form_data = _.cloneDeep(req.body);
		if (_.get(req, 'file.path')) {
			applicationObj.resume_url = path.join(__dirname, req.file.path);
		}
		applicationObj.user_id = applicationObj.form_data.user_id;
		applicationObj.job_id = applicationObj.form_data.job_id;
		delete applicationObj.form_data.user_id;
		delete applicationObj.form_data.job_id;
		delete applicationObj.form_data.file;
		const application = await app.models.application.create(applicationObj);
		res.json(application);
	},

	/*
	 PUT /api/applications/{id} - Update existing application(Add references info)
	 */
	async update({ params, body }, res) {
		const updateObj = _.cloneDeep(body);
		if (body && body.references_info) {
			updateObj.form_status = 'complete';
			app.models.application.update({
				id: params.application,
			}, updateObj, async (err, application) => {
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
		} else {
			res.json(await app.models.application.update({ id: params.application }, updateObj));
		}
	},

});
