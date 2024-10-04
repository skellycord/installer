import { red, green } from "../utils.js";
import { join } from "path";
import { readFileSync, writeFile } from "fs";
import { findPath } from "../backend.mjs";

export default function(target, writeCallback, exitCallback) {
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

    if (coreFile.split("\n").length != 1) {
        if (coreFile.includes("skellycord")) {
            writeCallback(corePath, exitCallback).then(() => {
                green("Skellycord successfully reinjected.");
                exitCallback(0);
            });
            
            return;
        }
        else {
            red("A different mod appears to be injected. Please uninject it and try again.");

            exitCallback(1);
            return;
        }
    }

    writeCallback(corePath, exitCallback)
    .catch(e => {
        red("Write process failed.");
        console.error(e);

        exitCallback(1);
    })
    .then(() => {
        let code = 
"// SKELLYCORD\n" +
"const { existsSync, rmSync, renameSync } = require('fs');\n" +
"const { join } = require('path');\n(" +
(() => {
if (existsSync(join(__dirname, "_skellycord.asar"))) {
    rmSync(join(__dirname, "skellycord.asar"));
    renameSync(
        join(__dirname, "_skellycord.asar"), 
        join(__dirname, "skellycord.asar")
    );
}
}).toString() + 
")();\n" +
"require('./skellycord.asar/main.min.js');\n" +
"module.exports = require('./core.asar');";
        
        writeFile(join(corePath, "index.js"), code, err => {
            if (err) red("Failed to write to the desktop core.");
            else green("Skellycord injected successfully. Be sure to restart discord.");

            exitCallback(err ? 1 : 0);
            return;
        });
    });
};