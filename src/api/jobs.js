import resource from '../lib/resource-router';
import jobsService from '../services/jobsService';
import config from '../../config/index';

export default ({ app }) => resource({
	id: 'job',

    /*
     GET /api/jobs - Fetching jobs at max 10 per request
     */
	async index({ params, query }, res) {
		const limit = config.pageLimit;
		const page = parseInt(query.page || 1, 10);
		const skip = limit * (page - 1);
		const searchCriteria = {};
		if (query && query.location)			{ searchCriteria.location = query.location; }
		if (query && query.title)			{ searchCriteria.$text = { $search: query.title }; }
		const jobs = await jobsService.getJobs(app, searchCriteria, limit, skip);
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
     GET /api/jobs/count - Fetching count of jobs in db
     */
	async count({ params, query }, res) {
		const count = await app.models.job.count(query);
		res.json(count);
	},

    /*
     POST /api/jobs - Create a new job in db
     */
	async create({ body }, res) {
		const job = await app.models.job.create(body);
		res.json(job);
	},


});
