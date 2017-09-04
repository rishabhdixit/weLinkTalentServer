/**
 * Created by rishabhdixit on 16/06/2017.
 */
import * as _ from 'lodash';
import Promise from 'bluebird';
import resource from '../lib/resource-router';
import applicationsService from '../services/applicationsService';
import encryptDecryptService from '../services/encryptDecryptService';
import emailService from '../services/emailService';
import Constants from '../constants';

export default ({ app }) => resource({

	mergeParams: true,
	id: 'feedback',

	/*
	 POST /api/applications/{application}/feedback - Save referee feedback, and
	 /api/applications/{application}/feedback?requested_for=referee
	 /api/applications/{application}/feedback?requested_for=recruiter
	 */
	async create({ params, query, body }, res) {
		if (query && query.requested_for) {
			if (query.requested_for === Constants.REFEREE) {
				try {
					const application = await app.models.application.update({
						id: params.application,
					}, { referee_feedback_requested: true });
					const candidateProfileData = await app.models.profile.findOne({
						user: application[0].user_id,
					});
					let refereesData = [];
					application[0].references_info.forEach((reference) => {
						if (reference && reference.canContact === 'Yes') {
							refereesData.push(reference);
						}
					});
					_.forOwn(application[0].feedback, (value) => {
						refereesData = _.filter(refereesData, referee =>
							referee.emailAddress !== value.userEmail,
						);
					});
					const promiseArray = [];
					const tokensArray = [];
					// logic for sending emails to referees
					for (let i = 0; i < refereesData.length; i += 1) {
						const tokenObj = {
							applicationId: params.application,
							emailAddress: refereesData[i].emailAddress,
						};
						const buff = Buffer.from(JSON.stringify(tokenObj));
						const token = encryptDecryptService.encrypt(buff);
						const requestBody = {
							userType: Constants.REFEREE,
							appUrl: process.env.HOST ? 'http://welinktalent-client.herokuapp.com' : 'http://localhost:4200',
							refereeEmail: refereesData[i].emailAddress,
							refereeFirstName: refereesData[i].firstName,
							refereeLastName: refereesData[i].lastName,
							candidateFirstName: candidateProfileData.firstName,
							candidateLastName: candidateProfileData.lastName,
							token,
						};
						tokensArray.push({
							applicationId: params.application,
							emailAddress: refereesData[i].emailAddress,
							token,
							expired: false,
						});
						promiseArray.push(emailService.sendRefereeRequestFeedbackEmail(requestBody));
					}
					promiseArray.push(app.models.token.create(tokensArray));
					Promise.all(promiseArray)
						.then((emails) => {
							console.log('emails sent to referees ', emails);
						});
					// end of logic for email
					return res.json(application[0]);
				} catch (e) {
					res.status(500).json(e);
				}
			} else if (query.requested_for === Constants.RECRUITER) {
				try {
					const promiseArray = [];
					const application = await app.models.application.update({
						id: params.application,
					}, { recruiter_feedback_requested: true });
					const candidateDetails = await app.models.profile.findOne({
						where: { user: application[0].user_id },
						select: ['firstName', 'lastName', 'emailAddress'],
					});
					const recruiterDetails = await app.models.profile.findOne({
						where: { user: application[0].recruiter_id },
						select: ['firstName', 'lastName', 'emailAddress'],
					});
					/* const tokenObj = {
						applicationId: params.application,
						emailAddress: recruiterDetails.emailAddress,
					};
					const buff = Buffer.from(JSON.stringify(tokenObj));
					const token = encryptDecryptService.encrypt(buff);
					promiseArray.push(app.models.token.create({
						applicationId: params.application,
						emailAddress: recruiterDetails.emailAddress,
						token,
						expired: false,
					})); */
					const requestBody = {
						userType: Constants.RECRUITER,
						appUrl: process.env.HOST ? 'http://welinktalent-client.herokuapp.com' : 'http://localhost:4200',
						recruiterEmail: recruiterDetails.emailAddress,
						recruiterFirstName: recruiterDetails.firstName,
						recruiterLastName: recruiterDetails.lastName,
						candidateFirstName: candidateDetails.firstName,
						candidateLastName: candidateDetails.lastName,
					};
					promiseArray.push(emailService.sendRecruiterRequestFeedbackEmail(requestBody));
					Promise.all(promiseArray)
						.then((emails) => {
							console.log('emails sent to referees ', emails);
						});
					// end of logic for email
					return res.json(application[0]);
				} catch (e) {
					res.status(500).json(e);
				}
			} else {
				return res.status(400).json({
					error: Constants.INVALID_QUERY_PARAMS,
				});
			}
		} else {
			const decryptedToken = encryptDecryptService.decrypt(body.token);
			if (decryptedToken === Constants.APPLICATION_NOT_FOUND) {
				return res.status(401).json({
					error: Constants.TOKEN_NOT_VALID,
				});
			}
			const application = await applicationsService.addFeedback(app, params.application, body);
			const candidateId = application.value && application.value.user_id;
			const refereeId = body.referee_id;
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
			promiseArray.push(app.models.profile.findOne({
				where: { user: refereeId },
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

			promiseArray.push(app.models.job.findOne(jobId));

			await Promise.all(promiseArray)
				.spread((expiredToken, candidate, referee, updatedApplication, job) => {
					const requestBody = {
						userType: Constants.CANDIDATE,
						appUrl: process.env.HOST ? 'http://welinktalent-client.herokuapp.com' : 'http://localhost:4200',
						candidateEmail: candidate.emailAddress,
						candidateFirstName: candidate.firstName,
						candidateLastName: candidate.lastName,
						refereeFirstName: referee.firstName,
						refereeLastName: referee.lastName,
						applicationId: updatedApplication[0].id,
						refereeId,
						jobTitle: job.title,
					};
					emailService.sendCandidateRefereeFeedbackEmail(requestBody)
						.then(() => {
							console.log('Email sent to the candidate'); // Success!
						}, (reason) => {
							console.log(reason); // Error!
						});
					res.json({ candidate, job });
				})
				.catch((err) => {
					console.log('Error is ', err);
					return res.status(500).json({
						error: err,
					});
				});
		}
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
