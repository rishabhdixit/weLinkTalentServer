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
import encryptDecryptService from '../services/encryptDecryptService';
import Constants from '../constants';

export default ({ app }) => resource({
	id: 'application',
	mergeParams: 'true',

	/*
	 GET /api/users/{user}/applications - Fetching applications at max 10, and
	 GET /api/users/{user}/applications?jobId={id} - Return status of application regarding this job
	 */
	async index({ params, query }, res) {
		const limit = config.pageLimit;
		const page = parseInt(query.page || 1, 10);
		const skip = limit * (page - 1);
		if (_.isUndefined(query.jobId)) {
			const applicationsCount = await app.models.application.count({ user_id: params.user });
			let applications = await app.models.application.find({
				select: ['user_id', 'job_id', 'form_status', 'validation_status', 'submission_status', 'acceptance_status', 'feedback_requested'],
				where: { user_id: params.user },
			})
				.skip(skip)
				.limit(limit);
			if (applications && applications.length) {
				const jobIds = [];
				applications.forEach((application) => {
					jobIds.push(new ObjectID(application.job_id.toString()));
				});
				const searchCriteria = {
					_id: { $in: jobIds },
				};
				const projectionObj = {
					company: 1,
					description: 1,
					location: 1,
					title: 1,
					application_slots: 1,
					remaining_slots: 1,
				};
				const jobs = await jobsService.getJobs(app, searchCriteria, projectionObj);
				applications = _.map(applications, application => _.extend(application, _.omit(_.find(jobs, { _id: new ObjectID(application.job_id.toString()) }), ['_id'])));
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
		} else {
			const searhQuery = {
				user_id: params.user,
				job_id: query.jobId,
			};
			const application = await app.models.application.findOne(searhQuery);
			let applicationStatus = application && application.form_status;
			applicationStatus = applicationStatus || Constants.APPLICATION_STATUS.INCOMPLETE;
			res.json({ status: applicationStatus });
		}
	},

	/*
	 GET /api/applications/id - Fetching single application
	 */
	async read({ params }, res) {
		const application = await app.models.application.findOne({ id: params.application });
		const applicationId = application && application.id;
		const result = applicationId ? application : { error: Constants.APPLICATION_NOT_FOUND };
		res.json(result);
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
									refereeEmail: referencesInfo[i].email,
									refereeName: `${referencesInfo[i].fname} ${referencesInfo[i].lname}`,
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
