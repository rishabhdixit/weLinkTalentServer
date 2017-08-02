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
		const sort = { updatedAt: -1 };
		const searchCriteria = { archived: { $ne: true } };
		const projectionObj = {};
		if (query && query.location)			{ searchCriteria.location = query.location; }
		if (query && query.title)			{ searchCriteria.$text = { $search: `"${query.title}"` }; }
		if (params && params.user) {
			searchCriteria.employer_id = params.user;
		}
		const jobs = await jobsService.getJobs(app, searchCriteria, projectionObj, limit, skip, sort);
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
		const job = await app.models.job.findOne({ id: params.job, archived: { $ne: true } });
		res.json(job);
	},

    /*
     POST /api/jobs - Create a new job in db
     */
	async create(req, res) {
		const jobObj = _.cloneDeep(req.body);
		if (_.get(req, 'file.path')) {
			// jobObj.company_logo = path.join(__dirname, req.file.path);
			if (process.env.HOST) {
				jobObj.company_logo = path.join(config.host, req.file.filename);
			} else {
				const domain = `${config.host}:${config.port}`;
				jobObj.company_logo = path.join(domain, req.file.filename);
			}
		}
		_.forOwn(jobObj, (value, key) => {
			try {
				jobObj[key] = JSON.parse(value);
			} catch (e) {
				jobObj[key] = value;
			}
		});
		jobObj.remaining_slots = jobObj.application_slots;
		const job = await app.models.job.create(jobObj);
		res.json(job);
	},

	/*
	 PUT /api/jobs/{id} - Update a job in db
	 */
	async update(req, res) {
		const jobObj = _.cloneDeep(req.body);
		if (_.get(req, 'file.path')) {
			if (process.env.HOST) {
				jobObj.company_logo = path.join(config.host, req.file.filename);
			} else {
				const domain = `${config.host}:${config.port}`;
				jobObj.company_logo = path.join(domain, req.file.filename);
			}
		}
		_.forOwn(jobObj, (value, key) => {
			try {
				jobObj[key] = JSON.parse(value);
			} catch (e) {
				jobObj[key] = value;
			}
		});
		const job = await app.models.job.findOne({ id: req.params.job });
		const slotsIncreased = (job.application_slots <= jobObj.application_slots);
		const slotsMoreThanRemaining = (job.remaining_slots <= jobObj.application_slots);
		if (slotsIncreased || slotsMoreThanRemaining) {
			jobObj.remaining_slots += (jobObj.application_slots - job.application_slots);
		} else {
			jobObj.remaining_slots = 0;
		}
		const updatedJob = await app.models.job.update({ id: req.params.job }, jobObj);
		res.json(updatedJob);
	},

	/*
	 DELETE /api/jobs/{id} - Delete a job
	 */
	async delete({ params, body }, res) {
		const deletedJob = await app.models.job.update({ id: params.job }, { archived: true });
		res.json(deletedJob);
	},

});
