/**
 * Created by rishabhdixit on 16/06/2017.
 */
import * as _ from 'lodash';
import Promise from 'bluebird';
import resource from '../lib/resource-router';
import applicationsService from '../services/applicationsService';
import jobsService from '../services/jobsService';
import Constants from '../constants';

export default ({ app }) => resource({

	mergeParams: true,
	id: 'feedback',

	/*
	 POST /api/applications/{application}/feedback - Save referee feedback
	 */
	async create({ params, body }, res) {
		const application = await applicationsService.addFeedback(app, params.application, body);
		const candidateId = application.value && application.value.user_id;
		const jobId = application.value && application.value.job_id;
		let canContactReferences = 0;
		const promiseArray = [];
		promiseArray.push(app.models.profile.findOne({
			where: { user: candidateId },
			select: ['firstName', 'lastName', 'emailAddress'],
		}));
		if (_.get(application, 'value') && _.get(application, 'value.references_info')) {
			let formStatus;
			let referenceStatus;
			let applicationStatus;
			const feedbacks = (_.get(application, 'value.feedback') && (_.size(application.value.feedback) + 1)) || 1;
			application.value.references_info.forEach((reference) => {
				if (reference.canContact === 'Yes') {
					canContactReferences += 1;
				}
			});
			if (feedbacks < canContactReferences) {
				formStatus = Constants.STATUS.COMPLETE;
				referenceStatus = Constants.STATUS.REPLIED;
				applicationStatus = Constants.STATUS.COMPLETED;
			} else {
				formStatus = Constants.STATUS.SUBMITTED;
				referenceStatus = Constants.STATUS.REPLIED;
				applicationStatus = Constants.STATUS.COMPLETED;
			}
			promiseArray.push(app.models.application.update({
				id: params.application,
			}, {
				form_status: formStatus,
				reference_status: referenceStatus,
				application_status: applicationStatus,
			}));
		}

		if (_.get(application, 'value') && _.isEmpty(application.value.feedback)) {
			promiseArray.push(jobsService.updateJobSlots(app, jobId, params.application));
		} else {
			promiseArray.push(app.models.job.findOne(jobId));
		}

		await Promise.all(promiseArray)
			.spread((candidate, updatedApplication, job) => res.json({ candidate, job }))
			.catch((err) => {
				console.log('Error is ', err);
				res.status(500).json({
					error: err,
				});
			});
	},
});
