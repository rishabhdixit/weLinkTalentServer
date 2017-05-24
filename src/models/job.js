/**
 * Created by rishabhdixit on 23/05/2017.
 */

import Waterline from 'waterline';

const Job = Waterline.Collection.extend({
    identity: 'job',
    connection: 'default',

    attributes: {

        employer_id: {
            type: 'string',
            required: true
        },

        description: {
            type: 'string',
            required: true
        },

        employment_type: {
            type: 'string'
        },

        company: {
            type: 'json',
            required: true
        },

        responsibilities: {
            type: 'array',
        },

        ideal_talent: {
            type: 'array',
        },

        skills: {
            type: 'array',
        },

        criteria: {
            type: 'array',
        },

        questions: {
            type: 'array',
        },

        title: {
            type: 'string',
            required: true
        },

        years_experience: {
            type: 'float',
            required: true
        },

        location: {
            type: 'string',
            required: true
        },

        visa_passport_constraints: {
            type: 'string',
        },

        salary_from: {
            type: 'float',
            required: true
        },

        salary_to: {
            type: 'float',
            required: true
        },

        contact_name: {
            type: 'string'
        },

        contact_number: {
            type: 'string'
        },

        contact_email: {
            type: 'string'
        },

        industry: {
            type: 'string'
        },

        expertise: {
            type: 'string'
        },

        salary_currency: {
            type: 'string',
            required: true
        }

    },
});

export default Job;
