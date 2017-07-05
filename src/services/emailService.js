/**
 * Created by rishabhdixit on 19/06/2017.
 */
import { transporter } from '../../config/index';

function sendEmail(mailOptions, smtpTransport) {
	return new Promise((resolve, reject) => {
		smtpTransport.sendMail(mailOptions, (error, response) => {
			if (error) {
				console.error(`Could not send email err: ${error}`);
				reject(error);
			} else {
				console.log(`Message sent: ${response.message}`);
				resolve(response);
			}

		// smtpTransport.close();
		});
	});
}

module.exports = {
	sendRefereeEmail(requestBody) {
		const emailMessageBody = `Dear ${requestBody.refereeName},<br><br>` +
			`This email has been sent to you because ${requestBody.candidateName} has added you as a referee in our application WeLinkTalent.com http://localhost:4200.<br><br>` +
			`So we request you to kindly take out some time and provide your feedback on our application. Here is the link - <a href="http://localhost:4200/referee-token?token=${requestBody.token}">Click Here</a>`;

		console.log('Sending new verify email to referee...');

		const mailOptions = {
			from: 'WeLinkTalent <welinktalent@gmail.com>',
			to: requestBody.refereeEmail,
			subject: `Verify ${requestBody.candidateName}'s details`,
			html: emailMessageBody,
		};

		return sendEmail(mailOptions, transporter);
	},
};

