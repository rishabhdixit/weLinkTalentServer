/**
 * Created by rishabhdixit on 16/06/2017.
 */
import * as _ from 'lodash';
import Promise from 'bluebird';
import resource from '../lib/resource-router';
import applicationsService from '../services/applicationsService';
import encryptDecryptService from '../services/encryptDecryptService';
import jobsService from '../services/jobsService';
import Constants from '../constants';

export default ({ app }) => resource({

	mergeParams: true,
	id: 'feedback',

	/*
	 POST /api/applications/{application}/feedback - Save referee feedback
	 */
	async create({ params, body }, res) {
		const decryptedToken = encryptDecryptService.decrypt(body.token);
		if (decryptedToken === Constants.APPLICATION_NOT_FOUND) {
			return res.status(401).json({
				error: Constants.TOKEN_NOT_VALID,
			});
		}
		const application = await applicationsService.addFeedback(app, params.application, body);
		const candidateId = application.value && application.value.user_id;
		const jobId = application.value && application.value.job_id;
		let canContactReferences = 0;
		const promiseArray = [];
		promiseArray.push(app.models.token.update({
			emailAddress: decryptedToken.emailAddress,
			applicationId: decryptedToken.applicationId,
		}, {
			expired: true,
		}));
		promiseArray.push(app.models.profile.findOne({
			where: { user: candidateId },
			select: ['firstName', 'lastName', 'emailAddress'],
		}));
		if (_.get(application, 'value') && _.get(application, 'value.references_info')) {
			let formStatus;
			let referenceStatus;
			const feedbacks = (_.get(application, 'value.feedback') && (_.size(application.value.feedback) + 1)) || 1;
			application.value.references_info.forEach((reference) => {
				if (reference.canContact === 'Yes') {
					canContactReferences += 1;
				}
			});
			if (feedbacks < canContactReferences) {
				formStatus = Constants.STATUS.COMPLETE;
				referenceStatus = Constants.STATUS.REPLIED;
			} else {
				formStatus = Constants.STATUS.SUBMITTED;
				referenceStatus = Constants.STATUS.REPLIED;
			}
			promiseArray.push(app.models.application.update({
				id: params.application,
			}, {
				form_status: formStatus,
				reference_status: referenceStatus,
			}));
		}

		if (_.get(application, 'value') && _.isEmpty(application.value.feedback)) {
			promiseArray.push(jobsService.updateJobSlots(app, jobId, params.application));
		} else {
			promiseArray.push(app.models.job.findOne(jobId));
		}

		await Promise.all(promiseArray)
			.spread((expiredToken, candidate, updatedApplication, job) => res.json({ candidate, job }))
			.catch((err) => {
				console.log('Error is ', err);
				return res.status(500).json({
					error: err,
				});
			});
	},

	/*
	 PUT /api/applications/{application}/feedback/{id} - Update/Approve feedback
	 */
	async update({ params, body }, res) {
		let updateObj = {};
		if (body[Constants.STATUS.APPROVED_BY_CANDIDATE]) {
			updateObj[Constants.STATUS.APPROVED_BY_CANDIDATE] = true;
			updateObj.reference_status = Constants.STATUS.APPROVED;
			updateObj.application_status = Constants.STATUS.COMPLETED;
		}
		_.forOwn(body, (value, key) => {
			updateObj[`feedback.${params.feedback}.${key}`] = value;
		});
		updateObj = JSON.parse(JSON.stringify(updateObj));
		res.json(await applicationsService.updateApplication(app, params.application, updateObj));
	},
});
