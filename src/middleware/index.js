import { Router } from 'express';

/**
 * Standard interface for middlewares
 */

/* eslint no-unused-vars: 0 */
export default ({ config, app }) => {
	const routes = Router();

	// add middleware here

	return routes;
};
