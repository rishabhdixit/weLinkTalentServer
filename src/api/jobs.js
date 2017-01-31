import resource from '../lib/resource-router-middleware';

const dummy = [
	{
		id: 'd8ec627e-c240-11e6-9c27-a4aad2a75d55',
		created_at: 'Sat Jan 28 00:58:31 UTC 2017',
		title: 'Tech Lead / Senior Engineer',
		description: 'Generalist who’s built big systems and led projects with three or more engineers. Ideally have experience with one or more of AWS, Google Cloud, Azure, Heroku, and friends.',
		type: 'Full Time',
		company: 'mLab',
		skills: 'Back-end is mostly Node.js, with some Java and Python. Front-end is a mix of Angular and raw Javascript/HTML/CSS.',
		yearsExperience: '0-2 Yrs',
		location: 'San Francisco',
	},
	{
		id: 'b9a9562e-5356-11e5-93eb-ffd6595b8eeb',
		created_at: 'Sat Jan 28 00:53:07 UTC 2017',
		title: 'Developer Evangelist/Advocate (aka Crafty Coder Who Loves Evangelism)',
		description: 'We are looking for a code-slinger with a (latent?) passion for marketing and evangelism who will join us in recruiting and driving the success of current and future MongoLab users. You know the concerns, interests, demographics,\n    and cultures of the developer audience, and you have creative ideas around how we can connect deeply and effectively with them.\nThe Developer Advocate role at MongoLab wears many hat: marketing, support, PR, and business development. As a key member of our small, rapidly growing marketing team, you will be the face and voice of MongoLab to developers using a wide range of development\n    frameworks and languages.',
		type: 'Full Time',
		company: 'Mongolab',
		skills: 'Node.JS, Python, Ruby, and many others. You&#39;ll be exposed to the major cloud platforms, as we currently run on Amazon (AWS), Azure, and Google, and have integrated with all of the major Platform-as-a-Service\n    providers (Heroku et al.)',
		location: 'San Francisco, CA',
		yearsExperience: '0-3 Yrs',
	},
	{
		id: 'a13350e4-e33e-11e6-8d1d-5d2a09f59764',
		created_at: 'Wed Jan 25 20:42:05 UTC 2017',
		title: 'Senior/Lead Software Engineer',
		description: 'Chartio is changing how companies work by building the best visualization interface to data. We make connection easy and building dashboards intuitive, so anyone on a team can create beautiful charts and draw meaningful insight from their data.Old Business Intelligence tools were complicated, expensive and just plain bad. We mean to change all that.And that&#39;s where you come in. We&#39;re looking for software engineers familiar with both back and front-end development to work with us on all parts of the stack. People have their focuses but no one knows just a single part of the stack here.',
		type: 'Full Time',
		company: 'Chartio',
		skills: 'Python experience\nJavascript experience\nLinux/Unix server administration\nKnowledge of networking protocols\nDatabase',
		yearsExperience: '5 Yrs',
		location: 'San Francisco, CA',
	},
	{
		id: '225a3ac8-d923-11e6-96e5-86fdf042a0e6',
		created_at: 'Fri Jan 13 00:00:19 UTC 2017',
		title: 'Senior Server Engineer',
		description: 'Shopkick is looking for Senior Server Engineer with a strong background in OO programming languages to help further our mission, continue the growth of our legacy segments and help build from the ground up our new and exciting initiatives.To be successful in this role you will have the desire to work on high visibility projects that have significant impact on the team and company, thrive in a highly collaborative team, love the buzz of a fast paced agile environment, supportive coworkers who respect quality code, and love the challenges of building server systems that are used by millions of users.',
		type: 'Full Time',
		company: 'Shopkick',
		skills: 'Java, C#, C++, Python etc',
		location: 'Redwood City, CA',
		yearsExperience: '4+ Yrs',
	},
];

export default () => resource({
	id: 'job',

	async index({ params }, res) {
		return res.json(dummy);
	},
});
