import resource from '../lib/resource-router';
import jobsService from '../services/jobsService';
import config from '../../config/index';

export default ({ app }) => resource({
	id: 'job',
	mergeParams: true,

    /*
     GET /api/jobs - Fetching jobs at max 10 per request
     */
	async index({ params, query }, res) {
		const limit = config.pageLimit;
		const page = parseInt(query.page || 1, 10);
		const skip = limit * (page - 1);
		const searchCriteria = {};
		const projectionObj = {};
		if (query && query.location)			{ searchCriteria.location = query.location; }
		if (query && query.title)			{ searchCriteria.$text = { $search: `"${query.title}"` }; }
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
	 GET /api/users/id/jobs - Fetching jobs of a specific user at max 10 per request
	 */
	async index({ params, query }, res) {
		const limit = config.pageLimit;
		const page = parseInt(query.page || 1, 10);
		const skip = limit * (page - 1);
		const searchCriteria = {
			employer_id: params.user
		};
		const projectionObj = {};
		if (query && query.location)			{ searchCriteria.location = query.location; }
		if (query && query.title)			{ searchCriteria.$text = { $search: `"${query.title}"` }; }
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
	async create({ body }, res) {
		const job = await app.models.job.create(body);
		res.json(job);
	},

});
