'use strict'
const config = require('../config');
const chakram = require('chakram');
const Promise = require('bluebird');
const expect = chakram.expect;

describe("End to End Test", () => {
    describe("Jobs Api Test", () => {
        describe("/jobs", () => {
            it('Should return list of jobs with Page meta data', () => {
                return Promise.coroutine(function* () {
                    const res = yield chakram.get(`${config.API_URL}/api/jobs`);
                    expect(res.response.statusCode).to.equals(200);
                    expect(res.body.jobsList).to.exist;
                    expect(res.body.jobsList).not.to.be.empty;
                    expect(res.body.pageMetaData).to.exist;

                })()
            })
            it('Should return list of jobs with Page meta data, given a query', () => {
                return Promise.coroutine(function* () {
                    const res = yield chakram.get(`${config.API_URL}/api/jobs?title=java`);

                    expect(res.response.statusCode).to.equals(200);
                    expect(res.body.jobsList).to.exist;
                    expect(res.body.jobsList).not.to.be.empty;
                    expect(res.body.pageMetaData).to.exist;
                })()

            })

            it('Should return empty list of jobs with Page meta data, not valid query', () => {
                return Promise.coroutine(function* () {
                    const res = yield chakram.get(`${config.API_URL}/api/jobs?title=as*`);

                    expect(res.response.statusCode).to.equals(200);
                    expect(res.body.jobsList).to.exist;
                    expect(res.body.jobsList).to.be.empty;
                    expect(res.body.pageMetaData).to.exist;
                })()

            })

            //TODO - Continue with more possible scenarios

        })
    })
})