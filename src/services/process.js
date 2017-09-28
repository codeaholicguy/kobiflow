import Promise from "bluebird";

const { execAsync: exec } = Promise.promisifyAll(require("child_process"), {
  multiArgs: true
});

export { exec };
