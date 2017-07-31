/**
 * Created by rishabhdixit on 16/06/2017.
 */
import { ObjectID } from 'mongodb';
import * as _ from 'lodash';

module.exports = {
	addFeedback: async (app, applicationId, feedbackRecord) => new Promise((resolve, reject) => {
		app.models.application.native((err, collection) => {
			if (err) {
				reject(err);
			} else {
				const refereeId = _.get(feedbackRecord, 'referee_id');
				const feedbackObj = _.omit(feedbackRecord, ['referee_id']);
				if (_.get(feedbackObj, 'skills')) {
					feedbackObj.skills = JSON.parse(feedbackObj.skills);
				}
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
			}
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
};
