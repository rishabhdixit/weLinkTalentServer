/**
 * Created by rishabhdixit on 07/06/2017.
 */
import resource from '../lib/resource-router';
import usersService from '../services/usersService';
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
		if (user && user.bookmark_ids && user.bookmark_ids.length) {
			jobs = await app.models.job.find().where({ id: user.bookmark_ids }).skip(skip).limit(limit);
		}
		res.json(jobs);
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
