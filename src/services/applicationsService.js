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
				const referee_id = _.get(feedbackRecord, 'referee_id');
				const feedbackObj = _.omit(feedbackRecord, ['referee_id']);
				const updateObj = {
					["feedback." + referee_id]: feedbackObj
				};
				collection.update({_id: new ObjectID(applicationId.toString())},
					{$set: updateObj}, (error, result) => {
					if (error) {
						reject(error);
					} else {
						resolve(result);
					}
				});
			}
		});
	}),
};
