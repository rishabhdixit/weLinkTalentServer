'use strict';
// TODO : enable this once everything is set.
// if (!process.env.HOST) throw '==> HOST environment variable required. Example: http://localhost:8000'


module.exports = {
    API_URL: process.env.HOST || "http://localhost:8080",
};
