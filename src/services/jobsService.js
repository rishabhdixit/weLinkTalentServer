/**
 * Created by rishabhdixit on 25/05/2017.
 */
module.exports = {
    getJobs: async(app, search_criteria, limit, skip) => {
        return new Promise(function (resolve, reject) {
            app.models.job.native(function (err, collection) {
                if (err)
                    reject(err);
                else
                    collection.find(search_criteria, {}, {
                        'limit': limit,
                        'skip': skip
                    }).toArray(function (err, results) {
                        if (err)
                        		reject(err);
                        else
                            resolve(results);
                    });
            })
        })
    },
    getJobsCount: async(app, search_criteria) => {
        return new Promise(function (resolve, reject) {
            app.models.job.native(function (err, collection) {
                if (err)
                    reject(err);
                else
                    collection.count(search_criteria, function (err, count) {
                        if (err)
                        		reject(err);
                        else
                            resolve(count);
                    });
            })
        })
    }
}
