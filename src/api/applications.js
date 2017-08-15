/**
 * Created by rishabhdixit on 26/05/2017.
 */
import * as _ from 'lodash';
import path from 'path';
import { ObjectID } from 'mongodb';
import resource from '../lib/resource-router';
import config from '../../config/index';
import emailService from '../services/emailService';
import jobsService from '../services/jobsService';
import usersService from '../services/usersService';
import applicationsService from '../services/applicationsService';
import encryptDecryptService from '../services/encryptDecryptService';
import Constants from '../constants';

export default ({ app }) => resource({
	id: 'application',
	mergeParams: 'true',

	/*
	 GET /api/applications - Fetching all applications at max 10,
	 GET /api/users/{user}/applications - Fetching applications at max 10, and
	 GET /api/users/{user}/applications?jobId={id} - Return status of application regarding this job
	 */
	async index({ params, query }, res) {
		const limit = config.pageLimit;
		const page = parseInt(query.page || 1, 10);
		const skip = limit * (page - 1);
		const sort = 'updatedAt DESC';
		// GET /api/applications, and GET /api/users/{user}/applications
		if (_.isUndefined(params.user) || _.isUndefined(query.jobId)) {
			const queryObj = {};
			if (params.user) {
				queryObj.user_id = params.user;
			} else {
				queryObj.applied_by_candidate = true;
			}
			const applicationProjectionObj = {
				form_data: 0,
				feedback: 0,
				references_info: 0,
			};
			const applicationsCount = await app.models.application.count(queryObj);
			let applications = await applicationsService.getApplications(app,
				queryObj,
				applicationProjectionObj,
				limit, skip, sort);
			if (applications && applications.length) {
				const jobIds = [];
				const userIds = [];
				applications.forEach((application, index) => {
					applications[index].id = application._id;
					jobIds.push(new ObjectID(application.job_id.toString()));
					if (_.isUndefined(params.user)) {
						userIds.push(new ObjectID(application.user_id.toString()));
					}
				});
				let searchCriteria = {
					_id: { $in: jobIds },
				};
				const jobProjectionObj = {
					company: 1,
					description: 1,
					location: 1,
					title: 1,
					application_slots: 1,
					remaining_slots: 1,
				};
				const jobs = await jobsService.getJobs(app, searchCriteria, jobProjectionObj);
				// add job projectionObj fields to application object inside nested job object
				applications = _.map(applications, application => _.extend(application, {
					job: _.find(jobs, { _id: new ObjectID(application.job_id.toString()) }),
				}));
				if (_.isUndefined(params.user)) {
					const userProjectionObj = {
						firstName: 1,
						lastName: 1,
						emailAddress: 1,
						user: 1,
						_id: 0,
					};
					searchCriteria = {
						user: { $in: userIds },
					};
					const users = await usersService.getProfiles(app, searchCriteria, userProjectionObj);
					// add user data inside each applications object
					applications = _.map(applications, application => _.extend(application, {
						user: _.omit(_.extend(_.find(users, {
							user: new ObjectID(application.user_id.toString()),
						}),
								{ _id: application.user_id }), ['user']),
					}));
				}
			}
			const pageMetaData = {
				size: (applications && applications.length) || 0,
				pageNumber: page,
				totalPages: Math.ceil(applicationsCount / limit),
				totalSize: applicationsCount,
			};
			const finalResponse = {
				applicationsList: applications,
				pageMetaData,
			};
			res.json(finalResponse);
		} else {			// GET /api/users/{user}/applications?jobId={id}
			const searhQuery = {
				user_id: params.user,
				job_id: query.jobId,
			};
			const application = await app.models.application.findOne(searhQuery);
			const id = application && application.id;
			const status = id ? Constants.APPLICATION_FOUND : Constants.APPLICATION_NOT_FOUND;
			res.json({ status });
		}
	},

	/*
	 GET /api/applications/id - Fetching single application
	 */
	async read({ params }, res) {
		const application = await app.models.application.findOne({ id: params.application });
		if (application && application.id) {
			const refereeIds = [];
			_.forOwn(application.feedback, (value, key) => {
				refereeIds.push(key);
			});
			if (refereeIds && refereeIds.length) {
				const refereeDetails = await app.models.profile.find({
					select: ['emailAddress', 'firstName', 'lastName', 'user'],
					where: { user: refereeIds },
				});
				_.forEach(refereeDetails, (value) => {
					if (application.feedback[value.user]) {
						application.feedback[value.user].referee_profile = value;
					}
				});
			}
			res.json(application);
		} else {
			res.status(404).json({
				error: Constants.APPLICATION_NOT_FOUND,
			});
		}
	},

	/*
	 POST /api/applications - Create a new application in db
	 */
	async create(req, res) {
		const applicationObj = {};
		applicationObj.form_data = _.cloneDeep(req.body);
		if (req.files && req.files.length) {
			applicationObj.resume_urls = [];
			for (let i = 0; i < req.files.length; i += 1) {
				applicationObj.resume_urls.push(path.join(__dirname, req.files[i].path));
			}
		}
		if (_.get(applicationObj, 'form_data.skills')) {
			applicationObj.form_data.skills = JSON.parse(applicationObj.form_data.skills);
		}
		applicationObj.user_id = applicationObj.form_data.user_id;
		applicationObj.job_id = applicationObj.form_data.job_id;
		applicationObj.recruiter_id = applicationObj.form_data.recruiter_id;
		delete applicationObj.form_data.user_id;
		delete applicationObj.form_data.job_id;
		delete applicationObj.form_data.recruiter_id;
		delete applicationObj.form_data.files;
		const application = await app.models.application.create(applicationObj);
		res.json(application);
	},

	/*
	 PUT /api/applications/{id} - Update existing application(Add references info)
	 */
	async update({ params, body }, res) {
		const updateObj = _.cloneDeep(body);
		if (body && body.references_info) {
			updateObj.form_status = Constants.STATUS.COMPLETE;
			updateObj.reference_status = Constants.STATUS.SENT;
			try {
				const application = await app.models.application.update({
					id: params.application,
				}, updateObj);
				const jobId = application[0].job_id;
				const jobData = await app.models.job.findOne(jobId);
				const profileData = await app.models.profile.findOne({ user: application[0].user_id });
				const referencesInfo = application[0].references_info;
				const promiseArray = [];
				const tokensArray = [];
				// logic for sending emails to referees
				for (let i = 0; i < referencesInfo.length; i += 1) {
					if (referencesInfo[i].canContact === 'Yes') {
						const tokenObj = {
							applicationId: application[0].id,
							emailAddress: referencesInfo[i].emailAddress,
						};
						const buff = Buffer.from(JSON.stringify(tokenObj));
						const token = encryptDecryptService.encrypt(buff);
						const requestBody = {
							userType: Constants.REFEREE,
							appUrl: process.env.HOST ? 'http://welinktalent-client.herokuapp.com' : 'http://localhost:4200',
							userEmail: referencesInfo[i].emailAddress,
							userName: `${referencesInfo[i].firstName} ${referencesInfo[i].lastName}`,
							candidateName: `${profileData.firstName} ${profileData.lastName}`,
							token,
						};
						tokensArray.push({
							applicationId: application[0].id,
							emailAddress: referencesInfo[i].emailAddress,
							token,
							expired: false,
						});
						promiseArray.push(emailService.sendRefereeAdditionEmail(requestBody));
					}
				}
				promiseArray.push(app.models.token.create(tokensArray));
				Promise.all(promiseArray)
					.then((emails) => {
						console.log('emails sent to referees ', emails);
					});
				// end of logic for email
				res.json(jobData);
			} catch (err) {
				res.status(500).json(err);
			}
			/* app.models.application.update({
				id: params.application,
			}, updateObj, async (err, application) => {
				if (err) {
					return res.status(500).json({
						error: err
					});
				} else if (application && application.length) {
					try {
						const jobId = application[0].job_id;
						const jobData = await app.models.job.findOne(jobId);
						const profileData = await app.models.profile.findOne({ user: application[0].user_id });
						const referencesInfo = application[0].references_info;
						const promiseArray = [];
						const tokensArray = [];
						// logic for sending emails to referees
						for (let i = 0; i < referencesInfo.length; i += 1) {
							if (referencesInfo[i].canContact === 'Yes') {
								const tokenObj = {
									applicationId: application[0].id,
									emailAddress: referencesInfo[i].emailAddress,
								};
								const buff = Buffer.from(JSON.stringify(tokenObj));
								const token = encryptDecryptService.encrypt(buff);
								const requestBody = {
									userType: Constants.REFEREE,
									appUrl: process.env.HOST ? 'http://welinktalent-client.herokuapp.com' : 'http://localhost:4200',
									userEmail: referencesInfo[i].emailAddress,
									userName: `${referencesInfo[i].firstName} ${referencesInfo[i].lastName}`,
									candidateName: `${profileData.firstName} ${profileData.lastName}`,
									token,
								};
								tokensArray.push({
									applicationId: application[0].id,
									emailAddress: referencesInfo[i].emailAddress,
									token,
									expired: false,
								});
								promiseArray.push(emailService.sendRefereeAdditionEmail(requestBody));
							}
						}
						promiseArray.push(app.models.token.create(tokensArray));
						Promise.all(promiseArray)
							.then((emails) => {
								console.log('emails sent to referees ', emails);
							});
						// end of logic for email
						res.json(jobData);
					} catch (e) {
						res.json({ Error: e });
					}
				} else {
					res.status(500).json({
						error: Constants.APPLICATION_NOT_FOUND
					})
				}
			});*/
		} else {
			try {
				const application = await app.models.application.update({
					id: params.application,
				}, updateObj);
				const promiseArray = [];
				if (updateObj && updateObj.applied_by_candidate) {
					const jobId = application && application[0] && application[0].job_id;
					promiseArray.push(jobsService.updateJobSlots(app, jobId, params.application));
				}
				if (updateObj && updateObj.recruiter_comment) {
					const candidateDetails = await app.models.profile.findOne({
						where: { user: application[0].user_id },
						select: ['firstName', 'lastName', 'emailAddress'],
					});
					/* const recruiterDetails = await app.models.profile.findOne({
						where: { user: application[0].recruiter_id },
						select: ['firstName', 'lastName', 'emailAddress'],
					}); */
					const requestBody = {
						userType: Constants.CANDIDATE,
						appUrl: process.env.HOST ? 'http://welinktalent-client.herokuapp.com' : 'http://localhost:4200',
						userEmail: candidateDetails.emailAddress,
						userName: `${candidateDetails.firstName} ${candidateDetails.lastName}`,
						// recruiterName: `${recruiterDetails.firstName} ${recruiterDetails.lastName}`,
						recruiterFeedback: application[0].recruiter_comment,
					};
					promiseArray.push(emailService.sendCandidateRecruiterFeedbackEmail(requestBody));
					Promise.all(promiseArray)
						.then((emails) => {
							console.log('emails sent to referees ', emails);
						});
				}
				res.json(application[0]);
			} catch (e) {
				res.status(500).json(e);
			}
		}
	},

});
