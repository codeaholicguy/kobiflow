import Promise from "bluebird";

const { execAsync } = Promise.promisifyAll(require("child_process"), {
  multiArgs: true
});

export { execAsync };
