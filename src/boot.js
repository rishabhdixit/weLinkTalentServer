import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import winston from 'winston';
import path from 'path';
import expressWinston from 'express-winston';
import initializeDb from './db';
import auth from './middleware/auth';
import api from './api';
import config from '../config';

export default function bootServer(callback) {
	const app = express();

	app.server = http.createServer(app);

	app.use(express.static(path.resolve('./public/')));
	app.use(express.static(path.resolve('./public/api-docs')));
	app.use(express.static(path.resolve('./public/uploads')));

	// 3rd party middleware
	app.use(cors({
		exposedHeaders: config.corsHeaders,
	}));

	app.use(bodyParser.json({
		limit: config.bodyLimit,
	}));

	// middleware for req-res logs
	app.use(expressWinston.logger({
		transports: [
			new winston.transports.Console({
				colorize: process.env.NODE_ENV !== 'production',
				prettyPrint: true,
			}),
		],
		meta: true,
		msg: 'HTTP {{req.method}} {{req.url}}',
		responseWhitelist: ['statusCode'],
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

		app.server.listen(config.port);

		app.server.on('listening', callback);
	});
}
