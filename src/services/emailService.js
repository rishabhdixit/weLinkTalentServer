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
		const emailMessageBody = `Dear ${requestBody.refereeFirstName},<br><br>` +
			`“${requestBody.candidateFirstName} ${requestBody.candidateLastName}” has listed you as a reference and we are contacting you in that capacity.<br><br>` +

		`-This reference will enable "${requestBody.candidateFirstName}" to apply.<br>` +
		'-It will take 10-15 minutes of your time.<br>' +
		'-This reference should be filled in the next 48 hours.<br>' +
		'-All information remains confidential between you and the candidate till the application sent.<br><br>' +

			'Below is a link to the short questionnaire.<br><br>' +

			'Please click the link below to get started.<br>' +
			`${requestBody.appUrl}/referee-feedback?token=${requestBody.token}<br><br>` +

		'Thank you for your trust.<br>' +
			'WeLinkTalent Team<br><br>' +

		'Need help?<br>' +
			'Process questions, please contact Nathalie White at nw@welinktalent.com<br><br>' +

			'www.welinktalent.com<br>' +
			'<img src="https://static.wixstatic.com/media/e01d06_c9ffba415a04427f8bf0e77e45cd1a29~mv2.png/v1/fill/w_152,h_152,al_c,usm_0.66_1.00_0.01/e01d06_c9ffba415a04427f8bf0e77e45cd1a29~mv2.png"><br>' +
			'WeLinkTalent Pte Ltd<br>' +
			'EA Licence № 16S8272<br>' +
			'This email is sent by WeLinkTalent Pte Ltd and may contain information that is privileged or confidential. If you are not the intended recipient, please delete the email and any attachments and notify us immediately.<br>';

		console.log('Sending new verify email to referee...');

		const mailOptions = {
			from: 'WeLinkTalent <welinktalent@gmail.com>',
			to: requestBody.refereeEmail,
			subject: `Verify ${requestBody.candidateFirstName}'s details`,
			html: emailMessageBody,
		};

		return sendEmail(mailOptions, transporter);
	},
	sendRefereeRequestFeedbackEmail(requestBody) {
		const emailMessageBody = `Dear ${requestBody.refereeFirstName},<br><br>` +
			`“${requestBody.candidateFirstName} ${requestBody.candidateLastName}” has listed you as a reference and we are contacting you in that capacity.<br><br>` +

			`-This reference will enable "${requestBody.candidateFirstName}" to apply.<br>` +
			'-It will take 10-15 minutes of your time.<br>' +
			'-This reference should be filled in the next 48 hours.<br>' +
			'-All information remains confidential between you and the candidate till the application sent.<br><br>' +

			'Below is a link to the short questionnaire.<br><br>' +

			'Please click the link below to get started.<br>' +
			`${requestBody.appUrl}/referee-feedback?token=${requestBody.token}<br><br>` +

			'Thank you for your trust.<br>' +
			'WeLinkTalent Team<br><br>' +

			'Need help?<br>' +
			'Process questions, please contact Nathalie White at nw@welinktalent.com<br><br>' +

			'www.welinktalent.com<br>' +
			'<img src="https://static.wixstatic.com/media/e01d06_c9ffba415a04427f8bf0e77e45cd1a29~mv2.png/v1/fill/w_152,h_152,al_c,usm_0.66_1.00_0.01/e01d06_c9ffba415a04427f8bf0e77e45cd1a29~mv2.png"><br>' +
			'WeLinkTalent Pte Ltd<br>' +
			'EA Licence № 16S8272<br>' +
			'This email is sent by WeLinkTalent Pte Ltd and may contain information that is privileged or confidential. If you are not the intended recipient, please delete the email and any attachments and notify us immediately.<br>';

		console.log('Sending request feedback email to referee...');

		const mailOptions = {
			from: 'WeLinkTalent <welinktalent@gmail.com>',
			to: requestBody.refereeEmail,
			subject: `Feedback for ${requestBody.candidateFirstName}'s application`,
			html: emailMessageBody,
		};

		return sendEmail(mailOptions, transporter);
	},
	sendRecruiterRequestFeedbackEmail(requestBody) {
		const emailMessageBody = 'Dear Recruiter,<br><br>' +
			`This email has been sent to you because "${requestBody.candidateFirstName} ${requestBody.candidateLastName}" has submitted an application and requested your feedback.<br><br>` +
			`So we request you to kindly take out some time and provide your feedback. Here is the link - <a href="${requestBody.appUrl}/applicants">Click Here</a><br><br>` +

			'Thank you for your trust.<br>' +
			'WeLinkTalent Team<br><br>' +

			'Need help?<br>' +
			'Process questions, please contact Nathalie White at nw@welinktalent.com<br><br>' +

			'www.welinktalent.com<br>' +
			'<img src="https://static.wixstatic.com/media/e01d06_c9ffba415a04427f8bf0e77e45cd1a29~mv2.png/v1/fill/w_152,h_152,al_c,usm_0.66_1.00_0.01/e01d06_c9ffba415a04427f8bf0e77e45cd1a29~mv2.png"><br>' +
			'WeLinkTalent Pte Ltd<br>' +
			'EA Licence № 16S8272<br>' +
			'This email is sent by WeLinkTalent Pte Ltd and may contain information that is privileged or confidential. If you are not the intended recipient, please delete the email and any attachments and notify us immediately.<br>';

		console.log('Sending request feedback email to recruiter...');

		const mailOptions = {
			from: 'WeLinkTalent <welinktalent@gmail.com>',
			to: requestBody.recruiterEmail,
			subject: `Feedback for ${requestBody.candidateFirstName}'s application`,
			html: emailMessageBody,
		};

		return sendEmail(mailOptions, transporter);
	},
	sendCandidateRefereeFeedbackEmail(requestBody) {
		const emailMessageBody = `Dear ${requestBody.candidateFirstName},<br><br>` +
				`"${requestBody.refereeFirstName} ${requestBody.refereeLastName}" just reviewed your application to the following role: "${requestBody.jobTitle}".<br>` +
			'Your reference is now filled and you can progress to applying to the role by sharing it with the hiring manager.<br><br>' +

			'Next Steps:<br>' +
			'1-Read your reference.<br>' +
			'2-Choose the reference you want to join to your application<br>' +
			'3-Apply<br><br>' +

			'Below is a link to your application and reference.<br>' +

				'Please click the link below or paste this into your browser to get started.<br>' +
				`${requestBody.appUrl}/job-application/${requestBody.applicationId}<br><br>` +

			'Thank you for your trust.<br>' +
				'WeLinkTalent Team<br><br>' +

		'Need help?<br>' +
			'Process questions, please contact Nathalie White at nw@welinktalent.com<br><br>' +

		'www.welinktalent.com<br>' +
		'<img src="https://static.wixstatic.com/media/e01d06_c9ffba415a04427f8bf0e77e45cd1a29~mv2.png/v1/fill/w_152,h_152,al_c,usm_0.66_1.00_0.01/e01d06_c9ffba415a04427f8bf0e77e45cd1a29~mv2.png"><br>' +
		'WeLinkTalent Pte Ltd<br>' +
		'EA Licence № 16S8272<br>' +
		'This email is sent by WeLinkTalent Pte Ltd and may contain information that is privileged or confidential. If you are not the intended recipient, please delete the email and any attachments and notify us immediately.<br>';

		console.log('Sending referee feedback email to candidate...');

		const mailOptions = {
			from: 'WeLinkTalent <welinktalent@gmail.com>',
			to: requestBody.candidateEmail,
			subject: `Your application for the "${requestBody.jobTitle}" position has been reviewed`,
			html: emailMessageBody,
		};

		return sendEmail(mailOptions, transporter);
	},
	sendCandidateRecruiterFeedbackEmail(requestBody) {
		const emailMessageBody = 'Dear Applicant,<br><br>' +
			'Recruiter has responded to your request for feedback:<br><br>' +
			`"${requestBody.recruiterFeedback}"<br><br>` +

			'Thank you for your trust.<br>' +
			'WeLinkTalent Team<br><br>' +

			'Need help?<br>' +
			'Process questions, please contact Nathalie White at nw@welinktalent.com<br><br>' +

			'www.welinktalent.com<br>' +
			'<img src="https://static.wixstatic.com/media/e01d06_c9ffba415a04427f8bf0e77e45cd1a29~mv2.png/v1/fill/w_152,h_152,al_c,usm_0.66_1.00_0.01/e01d06_c9ffba415a04427f8bf0e77e45cd1a29~mv2.png"><br>' +
			'WeLinkTalent Pte Ltd<br>' +
			'EA Licence № 16S8272<br>' +
			'This email is sent by WeLinkTalent Pte Ltd and may contain information that is privileged or confidential. If you are not the intended recipient, please delete the email and any attachments and notify us immediately.<br>';

		console.log('Sending new verify email to referee...');

		const mailOptions = {
			from: 'WeLinkTalent <welinktalent@gmail.com>',
			to: requestBody.candidateEmail,
			subject: 'Feedback from recruiter',
			html: emailMessageBody,
		};

		return sendEmail(mailOptions, transporter);
	},
};

