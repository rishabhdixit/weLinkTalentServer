/**
 * Created by rishabhdixit on 25/05/2017.
 */
module.exports = {
	getJobs: async (app, searchCriteria, limit, skip) => new Promise((resolve, reject) => {
		app.models.job.native((err, collection) => {
			if (err) {
				reject(err);
			}	else {
				collection.find(searchCriteria, {}, {
					limit,
					skip,
				}).toArray((error, results) => {
					if (error) {
						reject(error);
					}	else {
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
			}	else {
				collection.count(searchCriteria, (error, count) => {
					if (error) {
						reject(error);
					}	else {
						resolve(count);
					}
				});
			}
		});
	}),
};
