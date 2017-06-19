const sailsMongo = require('sails-mongo');
const nodemailer = require('nodemailer');

module.exports = {
	host: process.env.HOST || 'localhost',
	port: process.env.PORT || 8080,
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
		defaults: {
			migrate: 'safe',
		},
	},

	jwt: {
		secret: 'shhhh',
	},

	bcrypt: {
		rounds: 10,
	},

	linkedin: {
		appid: process.env.LINKEDIN_APPID || '81xkask6b0vp2j',
		secret: process.env.LINKEDIN_SECRET || 'omT8koGocxFVU0Vm',
		callback: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:8080/oauth/linkedin/callback',
		scope: ['r_basicprofile', 'r_emailaddress'],
	},

	transporter: nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false, // secure:true for port 465, secure:false for port 587
		auth: {
			user: 'welinktalent@gmail.com',
			pass: 'welinktalentviseo123',
		},
	}),

	pageLimit: 10,

	// Routes excluded from authentication
	excludedRoutes: [
		'/authenticate',
		'/authenticate/linkedin',
		'/oauth/linkedin',
		'/oauth/linkedin/callback',
		'/api/jobs',
		/^\/api\/users\/.*\/bookmarks/,
		/^\/api\/jobs\/.*/,
		'/api/applications',
		/^\/api\/applications\/.*/,
	],
};
