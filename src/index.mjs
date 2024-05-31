#! /usr/bin/env node
import inquirer from "inquirer";
import fetch from "node-fetch";
import { existsSync } from "fs";
import { findPath, REPO, NIGHTLY_RELEASE_ID, deleteAsar, blue, red, yellow } from "./utils.js";
import { writeFile } from "fs/promises";
import { join } from "path";
import inject from "./injectorFuncs/inject.js";
import uninject from "./injectorFuncs/uninject.js";

if (process.argv[2]) import("./oneshot.js");

else (function() {
    console.clear();
    blue("SKELLYCORD CLI", true);
    
    const availibleVersions = [];
    for (const target of ["stable", "ptb", "canary"]) {
        try {
            findPath(target);
            availibleVersions.push(target);
        } 
        catch {}
    }
    
    if (!availibleVersions.length) {
        console.log("No discord instances are availible.");
        preExit();
    }
    
    const questions = [
        {
            type: "list",
            name: "action",
            message: "Select Action",
            choices: [
                "Inject",
                "Uninject",
                "Exit"
            ]
        },
        {
            type: "list",
            name: "discordVer",
            message: "Select Discord Instance",
            choices: availibleVersions
        }
    ];
    
    const prompt = inquirer.createPromptModule();
    let action;
    
    prompt(questions[0]).then(ans => {
        if (ans.action === "Exit") {
            preExit();
            return;
        }
        action = ans.action;
    
        prompt(questions[1]).then(ans => {
            const deskswordPath = findPath(ans.discordVer);
            if (!existsSync(deskswordPath)) {
                console.log("No discord installation found.");
                preExit();
            }
    
            console.clear();
            switch (action) {
                case "Inject":
                    inject(
                        ans.discordVer,
                        downloadAndCopy,
                        preExit
                    );
                    break;
                case "Uninject":
                    uninject(
                        ans.discordVer,
                        deleteAsar,
                        preExit
                    );
                    break;
            }
        });
    });
})();

export async function downloadAndCopy(corePath, exitCallback) {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/${NIGHTLY_RELEASE_ID}/assets`);
    const assets = await res.json();

    const { name, browser_download_url } = assets.find(a => a.name === "skellycord.asar");

    const skellysar = await fetch(browser_download_url);
    const content = await skellysar.text();

    try {
        blue("Downloading skellycord.asar...");
        await writeFile(join(corePath, name), content);
    }
    catch (e) {
        red("Failed to download skellycord.asar.");
        exitCallback(1);
    }

    blue("Writing skellycord.asar to core...");
    await writeFile(join(corePath, "skellycord.asar"), content);
}

export function preExit(status) {
    yellow("Press any key to exit...");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", () => process.exit(status));
}