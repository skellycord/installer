import { join } from "path";
import { red, green } from "../utils.js";
import { readFileSync, writeFile } from "fs";
import { findPath } from "../backend.mjs";

export default function(target, deleteCallback, exitCallback) {
    const displayTarget = `discord${target !== "stable" ? `-${target}` : ""}`;
    let corePath;
    try {
        corePath = findPath(target);
    }
    catch (e) {
        red(`No ${displayTarget} installation found.`);
        exitCallback(1);
        return;
    }

    const coreFile = readFileSync(join(corePath, "index.js"), "utf8");

    if (coreFile.split("\n").length == 1) {
        red("Nothing to uninject...");
        exitCallback(1);
        return;
    }

    deleteCallback(corePath);

    const code = "module.exports = require('./core.asar');";

    writeFile(join(corePath, "index.js"), code, err => {
        if (err) red("Failed to write to the desktop core.");
        else green(`Skellycord uninjected successfully. Be sure to restart ${displayTarget}.`);

        exitCallback(err ? 1 : 0);
    });
};