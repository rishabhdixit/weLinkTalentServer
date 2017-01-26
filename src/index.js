import bootServer from './boot';

process.on('unhandledRejection', (error) => {
	console.log(error);
});

bootServer((app) => {
	console.log(`Started on port ${app.server.address().port}`);
});
