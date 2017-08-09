/**
 * Created by rishabhdixit on 08/08/2017.
 */
import { Router } from 'express';
import * as _ from 'lodash';
import encryptDecryptService from '../services/encryptDecryptService';
import Constants from '../constants';

export default ({ app }) => {
	const routes = Router();

	routes.post('/referee-feedback', async (req, res) => {
		if (req.body && req.body.token) {
			const decryptedToken = encryptDecryptService.decrypt(req.body.token);
			if (decryptedToken === Constants.APPLICATION_NOT_FOUND) {
				return res.status(401).json({
					error: Constants.TOKEN_NOT_VALID,
				});
			}
			const result = await app.models.token.findOne(decryptedToken);
			if (!_.isEmpty(result) && !result.expired) {
				return res.json({ data: result.applicationId });
			}
			return res.status(401).json({
				error: Constants.TOKEN_EXPIRED,
			});
		}
		return res.status(401).json({
			error: Constants.TOKEN_NOT_PROVIDED,
		});
	});

	return routes;
};
