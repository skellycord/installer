// whats chalk
const makeLog = (string, color, bold=false, prefix="|") => console.log(`${bold ? "\x1b[1m" : ""}\x1b[${color}m${prefix}\x1b[0m${bold ? "\x1b[1m" : ""} ${string} ${bold ? "\x1b[0m" : ""}`);
export function green(string, bold=false, prefix="|") { return makeLog(string, "32", bold, prefix); }
export function red(string, bold=false, prefix="|") { return makeLog(string, "31", bold, prefix); }
export function blue(string, bold=false, prefix="|") { return makeLog(string, "34", bold, prefix); }
export function yellow(string, bold=false, prefix="|") { return makeLog(string, "33", bold, prefix); }

export const REPO = "skellycord/skellycord";