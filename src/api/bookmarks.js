/**
 * Created by rishabhdixit on 07/06/2017.
 */
import { ObjectID } from 'mongodb';
import resource from '../lib/resource-router';
import usersService from '../services/usersService';
import jobsService from '../services/jobsService';
import config from '../../config/index';

export default ({ app }) => resource({
	mergeParams: true,
	id: 'bookmark',

	/*
	 GET /api/users/{user}/bookmarks
	 */
	async index({ params, query }, res) {
		const limit = config.pageLimit;
		const page = parseInt(query.page || 1, 10);
		const skip = limit * (page - 1);
		const user = await app.models.user.findOne({ where: { id: params.user }, select: ['bookmark_ids'] });
		let jobs = [];
		let jobsCount = 0;
		if (user && user.bookmark_ids && user.bookmark_ids.length) {
			const searchCriteria = {
				_id: { $in: user.bookmark_ids.map(id => new ObjectID(id.toString())) },
			};
			const projectionObj = {};
			jobs = await jobsService.getJobs(app, searchCriteria, projectionObj, limit, skip);
			jobsCount = await jobsService.getJobsCount(app, searchCriteria);
		}
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
	 POST /api/users/{user}/bookmarks - Create bookmark
	 */
	async create({ params, body }, res) {
		res.json(await usersService.addBookmark(app, params.user, body.postId));
	},

	/*
	 DELETE /api/users/{user}/bookmarks/{post} - Remove bookmark
	 */
	async delete({ params }, res) {
		res.json(await usersService.removeBookmark(app, params.user, params.bookmark));
	},

});
