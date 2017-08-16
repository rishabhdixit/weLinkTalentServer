import { Router } from 'express';

/**
 * Modified version of https://github.com/developit/resource-router-middleware
 *
 *  - Added support for `async` functions and error propagation to express error handlers
 *
 *    async index () {}
 *    async create () {}
 *
 */
const keyed = ['get', 'read', 'put', 'patch', 'update', 'del', 'delete'];
const map = { index: 'get', list: 'get', read: 'get', create: 'post', update: 'put', modify: 'patch', load: 'get', del: 'delete' };

export default function ResourceRouter(route) {
	const mergeParams = route.mergeParams;
	const router = Router({ mergeParams });

	if (!route.id) route.id = 'id';
	if (route.middleware) router.use(route.middleware);

	if (route.load) {
		router.param(route.id, (req, res, next, id) => {
			route.load(req, id, (err, data) => {
				if (err) {
					return res.status(404).send(err);
				}

				/* eslint no-param-reassign: 0 */
				req[route.id] = data;
				return next();
			});
		});
	}

	Object.keys(route).forEach((key) => {
		const fn = map[key] || key;

		if (typeof router[fn] === 'function') {
			/* eslint no-bitwise: 0 */
			const url = ~keyed.indexOf(key) ? `/:${route.id}` : '/';

			router[fn](url, (function handler(fnKey) {
				return (req, res, next) => {
					const promiseOrNot = route[fnKey](req, res);

					if (promiseOrNot && typeof promiseOrNot.catch === 'function') {
						promiseOrNot.catch((error) => {
							next(error);
						});
					}
				};
			}(key)));
		}
	});

	return router;
}
