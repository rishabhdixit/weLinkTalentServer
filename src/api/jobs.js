import resource from '../lib/resource-router';

export default ({ app }) => resource({
	id: 'job',

    /*
    GET /api/jobs - Fetching jobs at max 10 per request
     */
	async index({ params, query }, res) {
		const limit = 10;
		const page = query.page || 1;
		const skip = limit * (page - 1);
		const jobs = await app.models.job.find({ where: {}, limit, skip });
		res.json(jobs);
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
