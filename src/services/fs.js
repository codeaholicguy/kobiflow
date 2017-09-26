import Promise from "bluebird";

const { writeFileAsync } = Promise.promisifyAll(require("fs"));

export { writeFileAsync };
