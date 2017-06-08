/**
 * Created by rishabhdixit on 07/06/2017.
 */
import { ObjectID } from 'mongodb';

module.exports = {
	addBookmark: async (app, userId, postId) => new Promise((resolve, reject) => {
		app.models.user.native((err, collection) => {
			if (err) {
				reject(err);
			} else {
				collection.update({_id: new ObjectID(userId.toString())}, {$addToSet: {bookmark_ids: postId}}, (error, result) => {
					if (error) {
						reject(error);
					} else {
						resolve(result);
					}
				});
			}
		});
	}),
	removeBookmark: async (app, userId, postId) => new Promise((resolve, reject) => {
		app.models.user.native((err, collection) => {
			if (err) {
				reject(err);
			} else {
				collection.update({_id: new ObjectID(userId.toString())}, {$pull: {bookmark_ids: postId}}, (error, result) => {
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
