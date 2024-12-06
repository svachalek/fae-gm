import fs from "node:fs";
import { pino, stdTimeFunctions } from "pino";

const logStream = fs.createWriteStream("app.log", { flags: "a" });
const logger = pino(
  {
    timestamp: stdTimeFunctions.isoTime,
    base: null,
  },
  logStream,
);
export default logger;
