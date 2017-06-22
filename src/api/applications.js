/**
 * Created by rishabhdixit on 26/05/2017.
 */
import * as _ from 'lodash';
import path from 'path';
import resource from '../lib/resource-router';
import config from '../../config/index';
import emailService from '../services/emailService';
import encryptDecryptService from '../services/encryptDecryptService';
import Constants from '../constants';

export default ({ app }) => resource({
	id: 'application',

	/*
	 GET /api/applications - Fetching applications at max 10 per request
	 */
	async index({ params, query }, res) {
		const searhQuery = {
			user_id: query.userId,
		};
		if (query.jobId) {		// returning application status of a specific job by a user
			searhQuery.job_id = query.jobId;
			const application = await app.models.application.findOne(searhQuery);
			res.json({ status: application.form_status });
		} else {		// returning all applications of a user
			const limit = config.pageLimit;
			const page = parseInt(query.page || 1, 10);
			const skip = limit * (page - 1);
			res.json(await app.models.application.find(searhQuery).skip(skip).limit(limit));
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
