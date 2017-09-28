import Promise from "bluebird";

const {
  accessAsync: access,
  readFileAsync: readFile,
  writeFileAsync: writeFile
} = Promise.promisifyAll(require("fs"));

export { access, readFile, writeFile };
