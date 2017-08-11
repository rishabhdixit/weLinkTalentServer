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
	sendRefereeAdditionEmail(requestBody) {
		const emailMessageBody = `Dear ${requestBody.userName},<br><br>` +
			`This email has been sent to you because ${requestBody.candidateName} has added you as a referee in our application WeLinkTalent.com<br><br>` +
			`So we request you to kindly take out some time and provide your feedback on our application. Here is the link - <a href="${requestBody.appUrl}/referee-feedback?token=${requestBody.token}">Click Here</a>`;

		console.log('Sending new verify email to referee...');

		const mailOptions = {
			from: 'WeLinkTalent <welinktalent@gmail.com>',
			to: requestBody.userEmail,
			subject: `Verify ${requestBody.candidateName}'s details`,
			html: emailMessageBody,
		};

		return sendEmail(mailOptions, transporter);
	},
	sendRefereeRequestFeedbackEmail(requestBody) {
		const emailMessageBody = `Dear ${requestBody.userName},<br><br>` +
			`This email has been sent to you because ${requestBody.candidateName} has added you as a referee in our application WeLinkTalent.com<br><br>` +
			`So we request you to kindly take out some time and provide your feedback on our application. Here is the link - <a href="${requestBody.appUrl}/referee-feedback?token=${requestBody.token}">Click Here</a>`;

		console.log('Sending request feedback email to referee...');

		const mailOptions = {
			from: 'WeLinkTalent <welinktalent@gmail.com>',
			to: requestBody.userEmail,
			subject: `Feedback for ${requestBody.candidateName}'s application`,
			html: emailMessageBody,
		};

		return sendEmail(mailOptions, transporter);
	},
	sendRecruiterRequestFeedbackEmail(requestBody) {
		const emailMessageBody = `Dear ${requestBody.userName},<br><br>` +
			`This email has been sent to you because ${requestBody.candidateName} has submitted an application and requested your feedback.<br><br>` +
			`So we request you to kindly take out some time and provide your feedback. Here is the link - <a href="${requestBody.appUrl}/applicants">Click Here</a>`;

		console.log('Sending request feedback email to recruiter...');

		const mailOptions = {
			from: 'WeLinkTalent <welinktalent@gmail.com>',
			to: requestBody.userEmail,
			subject: `Feedback for ${requestBody.candidateName}'s application`,
			html: emailMessageBody,
		};

		return sendEmail(mailOptions, transporter);
	},
	sendCandidateRecruiterFeedbackEmail(requestBody) {
		const emailMessageBody = 'Dear Applicant,<br><br>' +
			'Recruiter has responded to your request for feedback:<br><br>' +
			`"${requestBody.recruiterFeedback}"`;

		console.log('Sending new verify email to referee...');

		const mailOptions = {
			from: 'WeLinkTalent <welinktalent@gmail.com>',
			to: requestBody.userEmail,
			subject: 'Feedback from recruiter',
			html: emailMessageBody,
		};

		return sendEmail(mailOptions, transporter);
	},
};

