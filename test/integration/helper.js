require('should');

const bootServer = require('../../src/boot');

/* eslint no-underscore-dangle: 0 */
/* eslint no-param-reassign: 0 */
exports.setup = (scope) => {
	if (scope._setup) {
		return;
	}

	scope._setup = true;

	beforeEach.call(scope, function (done) {
		// boot up new server process
		bootServer((app) => {
			this.app = app;

			done();
		});
	});

	afterEach.call(scope, function (done) {
		// drop database collection
		this.app.connections.default._adapter.drop('default', scope.collection, () => {
			// close waterline mongodb adapter connection
			this.app.connections.default._adapter.teardown(() => {
				// and shutdown express server
				this.app.server.close(done);
			});
		});
	});
};
