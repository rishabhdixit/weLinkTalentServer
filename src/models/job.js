/**
 * Created by rishabhdixit on 23/05/2017.
 */

import Waterline from 'waterline';

const Job = Waterline.Collection.extend({
    identity: 'job',
    connection: 'default',

    attributes: {

        description: {
            type: 'string',
            required: true
        },

        type: {
            type: 'string'
        },

        company: {
            type: 'string',
            required: true
        },

        responsibilities: {
            type: 'string',
        },

        ideal_talent: {
            type: 'string',
        },

        skills: {
            type: 'string',
        },

        criteria: {
            type: 'string',
        },

        questions: {
            type: 'string',
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
