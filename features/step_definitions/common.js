/* eslint new-cap: 0 */

const cucumber = require("cucumber");

cucumber.defineSupportCode(function({ Then }) {
    Then(/^I receive a HTTP (\w+) code$/, function(code, callback) {
        if(this.response.statusCode !== parseInt(code)) {
            throw new Error(`HTTP code was ${this.response.statusCode} but expected ${code}: ${JSON.stringify(this.response.body)}`);
        }

        callback();
    });
});
