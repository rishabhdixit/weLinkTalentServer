/**
 * Created by rishabhdixit on 16/06/2017.
 */
import * as _ from 'lodash';
import resource from '../lib/resource-router';
import applicationsService from '../services/applicationsService';
import jobsService from '../services/jobsService';

export default ({ app }) => resource({

	mergeParams: true,
	id: 'feedback',

	/*
	 POST /api/applications/{application}/feedback - Save referee feedback
	 */
	async create({ params, body }, res) {
		const application = await applicationsService.addFeedback(app, params.application, body);
		const jobId = application.value && application.value.job_id;
		if (_.get(application, 'value') && _.isEmpty(application.value.feedback)) {
			res.json(await jobsService.updateJobSlots(app, jobId, params.application));
		} else {
			res.json(await app.models.job.findOne(jobId));
		}
	},
});
