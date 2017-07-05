/**
 * Created by rishabhdixit on 20/06/2017.
 */
import crypto from 'crypto';
import { encryptionKey } from '../../config/index';
import Constants from '../constants';

const ENCRYPTION_KEY = encryptionKey; // Must be 256 bytes (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
	let encrypted = cipher.update(text);

	encrypted = Buffer.concat([encrypted, cipher.final()]);

	return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(text) {
	try {
		const textParts = text.split(':');
		const iv = new Buffer(textParts.shift(), 'hex');
		const encryptedText = new Buffer(textParts.join(':'), 'hex');
		const decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
		let decrypted = decipher.update(encryptedText);

		decrypted = Buffer.concat([decrypted, decipher.final()]);

		return decrypted.toString();
	} catch (e) {
		return Constants.APPLICATION_NOT_FOUND;
	}
}

module.exports = { decrypt, encrypt };
