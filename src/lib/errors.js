export class UnauthorizedError extends Error {
	constructor(message, code) {
		super(message);

		this.name = 'UnauthorizedError';
		this.code = code;
		this.status = 401;

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error(message)).stack;
		}
	}
}

export class InternalServerError extends Error {
	constructor(message, code) {
		super(message);

		this.name = 'InternalServerError';
		this.code = code;
		this.status = 500;

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error(message)).stack;
		}
	}
}

export default Error;
