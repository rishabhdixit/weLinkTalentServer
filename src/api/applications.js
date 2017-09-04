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
		const sort = { updatedAt: -1 };
		if (_.isUndefined(query.jobId) && _.isUndefined(params.user)) {
			// GET /api/applications
			const jobProjectionObj = {
				company: 1,
				description: 1,
				location: 1,
				title: 1,
				application_slots: 1,
				remaining_slots: 1,
			};
			const applicationProjectionObj = {
				form_data: 0,
				feedback: 0,
				references_info: 0,
			};
			const jobIds = [];
			const userIds = [];
			const searchCriteria = { archived: { $ne: true } };
			if (query.search) {
				searchCriteria.$text = { $search: `"${query.search}"` };
			}
			const jobs = await jobsService.getJobs(app, searchCriteria, jobProjectionObj, 0, 0, { 'company.name': 1, title: 1 });
			jobs.forEach((job) => {
				jobIds.push(job._id.toString());
			});
			const applicationSearchCriteria = {
				job_id: { $in: jobIds },
				applied_by_candidate: true,
			};
			const applicationsCount = await applicationsService.getApplicationsCount(
				app,
				applicationSearchCriteria,
			);
			let applications = await applicationsService.getApplications(
					app,
					applicationSearchCriteria,
					applicationProjectionObj,
					limit,
					skip,
					sort,
				);
			if (applications && applications.length) {
				applications.forEach((application, index) => {
					applications[index].id = application._id;
					userIds.push(new ObjectID(application.user_id.toString()));
				});
			}
			// add job projectionObj fields to application object inside nested job object
			applications = _.map(applications, application => _.extend(application, {
				job: _.find(jobs, { _id: new ObjectID(application.job_id.toString()) }),
			}));
			const userProjectionObj = {
				firstName: 1,
				lastName: 1,
				emailAddress: 1,
				user: 1,
				_id: 0,
			};
			const userSearchCriteria = {
				user: { $in: userIds },
			};
			const users = await usersService.getProfiles(app, userSearchCriteria, userProjectionObj);
			// add user data inside each applications object
			applications = _.map(applications, application => _.extend(application, {
				user: _.omit(_.extend(_.find(users, {
					user: new ObjectID(application.user_id.toString()),
				}),
					{ _id: application.user_id }), ['user']),
			}));
			applications = _.orderBy(applications, [application => application.job.company.name.toLowerCase(), application => application.job.title.toLowerCase()], ['asc', 'asc']);
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
		} else if (_.isUndefined(query.jobId) && !_.isUndefined(params.user)) {
			// GET /api/users/{user}/applications
			const queryObj = {};
			queryObj.user_id = params.user;
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
				applications.forEach((application, index) => {
					applications[index].id = application._id;
					jobIds.push(new ObjectID(application.job_id.toString()));
				});
				const searchCriteria = {
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
			}
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
							refereeEmail: referencesInfo[i].emailAddress,
							refereeFirstName: referencesInfo[i].firstName,
							refereeLastName: referencesInfo[i].lastName,
							candidateFirstName: profileData.firstName,
							candidateLastName: profileData.lastName,
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
		} else {
			try {
				if (updateObj && !_.isUndefined(updateObj.recruiter_reviewed)) {
					updateObj.application_status = updateObj.recruiter_reviewed ?
						Constants.STATUS.REVIEWED : Constants.STATUS.SUBMITTED;
				}
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
						candidateEmail: candidateDetails.emailAddress,
						candidateFirstName: candidateDetails.firstName,
						candidateLastName: candidateDetails.lastName,
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
	}
	,

});
