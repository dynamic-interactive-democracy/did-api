const cucumber = require("cucumber");
const config = require("config");

function World() {
    this.port = config.port;
    this.url = `http://localhost:${this.port}`;
}

cucumber.defineSupportCode(function({ setWorldConstructor }) {
    setWorldConstructor(World);
});
