import * as _ from 'lodash';
import path from 'path';
import resource from '../lib/resource-router';
import jobsService from '../services/jobsService';
import config from '../../config/index';

export default ({ app }) => resource({
	id: 'job',
	mergeParams: true,

    /*
     GET /api/jobs - Fetching jobs at max 10 per request,
	   GET /api/users/id/jobs - Fetching jobs of a specific user at max 10 per request
     */
	async index({ params, query }, res) {
		const limit = config.pageLimit;
		const page = parseInt(query.page || 1, 10);
		const skip = limit * (page - 1);
		const searchCriteria = {};
		const projectionObj = {};
		if (query && query.location)			{ searchCriteria.location = query.location; }
		if (query && query.title)			{ searchCriteria.$text = { $search: `"${query.title}"` }; }
		if (params && params.user) {
			searchCriteria.employer_id = params.user;
		}
		const jobs = await jobsService.getJobs(app, searchCriteria, projectionObj, limit, skip);
		const jobsCount = await jobsService.getJobsCount(app, searchCriteria);
		const pageMetaData = {
			size: (jobs && jobs.length) || 0,
			pageNumber: page,
			totalPages: Math.ceil(jobsCount / limit),
			totalSize: jobsCount,
		};
		const finalResponse = {
			jobsList: jobs,
			pageMetaData,
		};
		res.json(finalResponse);
	},

	/*
	 GET /api/jobs/id - Fetching single job
	 */
	async read({ params }, res) {
		const job = await app.models.job.findOne({ id: params.job });
		res.json(job);
	},

    /*
     POST /api/jobs - Create a new job in db
     */
	async create(req, res) {
		const jobObj = _.cloneDeep(req.body);
		if (_.get(req, 'file.path')) {
			jobObj.company_logo = path.join(__dirname, req.file.path);
		}
		jobObj.remaining_slots = jobObj.application_slots;
		const job = await app.models.job.create(jobObj);
		res.json(job);
	},

});
