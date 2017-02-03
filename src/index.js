import bootServer from './boot';
import config from '../config';

process.on('unhandledRejection', (error) => {
	console.log(error);
});

bootServer(() => {
	console.log(`Started on ${config.host}:${config.port}`);
});
