const sailsMongo = require('sails-mongo');

module.exports = {
	port: 8080,
	bodyLimit: '100kb',
	corsHeaders: ['link'],

	db: {
		adapters: {
			'sails-mongo': sailsMongo,
		},
		connections: {
			default: {
				adapter: 'sails-mongo',
				host: process.env.MONGODB_HOST || 'localhost',
				port: process.env.MONGODB_PORT || 27017,
				database: process.env.MONGODB_DBNAME || 'welinktalent',
			},
		},
	},

	jwt: {
		secret: 'shhhh',
	},

	bcrypt: {
		rounds: 10,
	},
};
