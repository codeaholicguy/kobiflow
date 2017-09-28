import Promise from "bluebird";

const requestAsync = Promise.promisify(require("request"));

export { requestAsync as request };
