/**
 * Created by rishabhdixit on 25/05/2017.
 */
import { ObjectID } from 'mongodb';

module.exports = {
	getJobs: async (app, searchCriteria, limit, skip) => new Promise((resolve, reject) => {
		app.models.job.native((err, collection) => {
			if (err) {
				reject(err);
			} else {
				collection.find(searchCriteria, {}, {
					limit,
					skip,
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
	getJobsCount: async (app, searchCriteria) => new Promise((resolve, reject) => {
		app.models.job.native((err, collection) => {
			if (err) {
				reject(err);
			} else {
				collection.count(searchCriteria, (error, count) => {
					if (error) {
						reject(error);
					} else {
						resolve(count);
					}
				});
			}
		});
	}),
	updateJobSlots: async (app, jobId, applicationId) => new Promise((resolve, reject) => {
		// Find job with jobId
		app.models.job.findOne({ id: jobId }, (err, jobRecord) => {
			if (err) reject(err);
			else {
				const updateObj = {};
				/*
				 Check if remaining slots greater than 0 then decrement the slots by 1 and
				 if remaining slots are equal to 0 then add user's application id into waiting queue
				 */
				if (jobRecord && jobRecord.remaining_slots > 0) {
					updateObj.$set = { remaining_slots: jobRecord.remaining_slots - 1 };
				} else if (jobRecord && jobRecord.remaining_slots === 0) {
					updateObj.$addToSet = { applications_waiting: applicationId.toString() };
				} else if (jobRecord && !jobRecord.remaining_slots) {
					updateObj.$set = { remaining_slots: jobRecord.application_slots - 1 };
				} else {
					reject('No job found');
				}
				app.models.job.native((error, collection) => {
					if (error) {
						reject(error);
					} else {
						// Update the job and return previously saved object not latest updated one
						collection.findAndModify(
							{ _id: new ObjectID(jobId.toString()) },
							{},
							updateObj,
							{ new: false },
							(updationError, updatedJob) => {
								if (updationError) reject(updationError);
								else if (updatedJob) {
									resolve(updatedJob);
								} else {
									reject('Job not updated');
								}
							});
					}
				});
			}
		});
	}),
};
