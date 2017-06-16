/**
 * Created by rishabhdixit on 16/06/2017.
 */
import resource from '../lib/resource-router';
import applicationsService from '../services/applicationsService';

export default ({ app }) => resource({

	mergeParams: true,
	id: 'feedback',

	/*
	 POST /api/applications/{application}/feedback - Save referee feedback inside application collection
	 */
	async create({ params, body }, res) {
		res.json(await applicationsService.addFeedback(app, params.application, body));
	},
});
