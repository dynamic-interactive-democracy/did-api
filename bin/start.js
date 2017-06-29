const package = require("../package");
const config = require("config");
const bunyan = require("bunyan");

const DidApp = require("../index");

let log = bunyan.createLogger({ name: package.name });

log.info({ environment: config.util.getEnv("NODE_ENV") }, "Starting did-app");

const didApp = new DidApp(log, config);

didApp.start((error) => {
    if(error) return log.error("Could not start did-App");
    log.info({ port: config.port }, "didApp started");
});
