/**
 * Created by rishabhdixit on 16/06/2017.
 */
import { ObjectID } from 'mongodb';
import * as _ from 'lodash';
import encryptDecryptService from '../services/encryptDecryptService';
import Constants from '../constants';

module.exports = {
	addFeedback: async (app, applicationId, feedbackRecord) => new Promise((resolve, reject) => {
		app.models.application.native((err, collection) => {
			if (err) {
				return reject(err);
			}
			const decryptedToken = encryptDecryptService.decrypt(feedbackRecord.token);
			if (decryptedToken === Constants.APPLICATION_NOT_FOUND) {
				return reject({ error: Constants.TOKEN_NOT_VALID });
			}
			const refereeId = _.get(feedbackRecord, 'referee_id');
			const feedbackObj = _.clone(feedbackRecord.feedback);
			feedbackObj.userId = refereeId;
			feedbackObj.userEmail = decryptedToken.emailAddress;
			feedbackObj[Constants.STATUS.APPROVED_BY_CANDIDATE] = false;
			const updateObj = {
				[`feedback.${refereeId}`]: feedbackObj,
			};
			collection.findOneAndUpdate({ _id: new ObjectID(applicationId.toString()) },
					{ $set: updateObj }, (error, result) => {
						if (error) {
							reject(error);
						} else {
							resolve(result);
						}
					});
		});
	}),
	getApplications: async (app, searchCriteria, projectionObj, limit, skip, sort) =>
		new Promise((resolve, reject) => {
			app.models.application.native((err, collection) => {
				if (err) {
					reject(err);
				} else {
					collection.find(searchCriteria, projectionObj, {
						limit,
						skip,
						sort,
					}).toArray((error, results) => {
						if (error) {
							reject(error);
						} else {
							resolve(results);
						}
					});
				}
			});
		}),
	updateApplication: async (app, applicationId, updateObj) =>
		new Promise((resolve, reject) => {
			app.models.application.native((err, collection) => {
				if (err) {
					reject(err);
				} else {
					const options = { returnOriginal: false };
					collection.findOneAndUpdate({ _id: new ObjectID(applicationId.toString()) },
						{ $set: updateObj },
						options, (error, result) => {
							if (error) {
								reject(error);
							} else {
								resolve(result.value);
							}
						});
				}
			});
		}),
};
