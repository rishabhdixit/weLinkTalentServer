import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import initializeDb from './db';
import auth from './middleware/auth';
import api from './api';
import config from '../config';

export default function bootServer(callback) {
	const app = express();

	app.server = http.createServer(app);

	// 3rd party middleware
	app.use(cors({
		exposedHeaders: config.corsHeaders,
	}));

	app.use(bodyParser.json({
		limit: config.bodyLimit,
	}));

	// connect to db
	initializeDb((db) => {
		// save on app for convenience
		app.models = db.collections;
		app.connections = db.connections;

		// auth middleware
		app.use(auth({ config, app }));

		// api router
		app.use('/api', api({ config, app }));

		app.server.listen(process.env.PORT || config.port);

		callback(app);
	});
}
