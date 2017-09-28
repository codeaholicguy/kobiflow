import Promise from "bluebird";
import { spawnSync } from "child_process";

const { execAsync } = Promise.promisifyAll(require("child_process"), {
  multiArgs: true
});

export { execAsync as exec, spawnSync };
