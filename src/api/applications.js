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
		// GET /api/users/{user}/applications, and GET /api/users/{user}/applications
		if (_.isUndefined(params.user) || _.isUndefined(query.jobId)) {
			const queryObj = {};
			if (params.user) {
				queryObj.user_id = params.user;
			}
			const applicationsCount = await app.models.application.count(queryObj);
			let applications = await app.models.application.find({
				select: ['user_id', 'job_id', 'form_status', 'validation_status', 'submission_status', 'acceptance_status', 'feedback_requested', 'updatedAt'],
				where: queryObj,
				skip,
				limit,
				sort,
			});
			if (applications && applications.length) {
				const jobIds = [];
				const userIds = [];
				applications.forEach((application) => {
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
				// add job projectionObj fields to application object and removing _id of job
				applications = _.map(applications, application => _.extend(application, _.omit(_.find(jobs, { _id: new ObjectID(application.job_id.toString()) }), ['_id'])));
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
					applications = _.map(applications, application => _.extend(application, _.find(users, {
						user: new ObjectID(application.user_id.toString()),
					})));
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
		delete applicationObj.form_data.user_id;
		delete applicationObj.form_data.job_id;
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
			updateObj.form_status = 'complete';
			app.models.application.update({
				id: params.application,
			}, updateObj, async (err, application) => {
				if (application && application.length) {
					try {
						const jobId = application[0].job_id;
						const jobData = await app.models.job.findOne(jobId);
						const profileData = await app.models.profile.findOne({ user: application[0].user_id });
						const referencesInfo = application[0].references_info;
						const promiseArray = [];
						// logic for sending emails to referees
						for (let i = 0; i < referencesInfo.length; i += 1) {
							if (referencesInfo[i].canContact === 'Yes') {
								const requestBody = {
									appUrl: process.env.HOST ? 'http://welinktalent-client.herokuapp.com' : 'http://localhost:4200',
									refereeEmail: referencesInfo[i].emailAddress,
									refereeName: `${referencesInfo[i].firstName} ${referencesInfo[i].lastName}`,
									candidateName: `${profileData.firstName} ${profileData.lastName}`,
									token: encryptDecryptService.encrypt(application[0].id),
								};
								promiseArray.push(emailService.sendRefereeEmail(requestBody));
							}
						}
						Promise.all(promiseArray)
							.then((emails) => {
								console.log('emails sent to referees ', emails);
							});
						// end of logic for email
						res.json(jobData);
					} catch (e) {
						res.json({ Error: e });
					}
				}
			});
		} else {
			res.json(await app.models.application.update({ id: params.application }, updateObj));
		}
	},

});
