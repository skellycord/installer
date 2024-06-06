#! /usr/bin/env node
import inquirer from "inquirer";
import { existsSync } from "fs";
import { blue, red, yellow } from "./utils.js";
import { writeFile } from "fs/promises";
import { join } from "path";
import { inject, uninject } from "./injectorFuncs";
import { downloadAsar, findPath } from "./backend.mjs";


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
        red("No discord instances are availible.");
        preExit();

        return;
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
            // anomoly code since this *shouldn't* happen
            if (!existsSync(deskswordPath)) {
                red("No discord installation found.");
                preExit();

                return;
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


export async function downloadAndCopy(corePath) {
    const fileName = "skellycord.asar";

    blue(`Downloading ${fileName}...`);
    const content = await downloadAsar();
    
    blue("Writing skellycord.asar to core...");
    await writeFile(join(corePath, "skellycord.asar"), content);
}

export function preExit(status) {
    yellow("Press any key to exit...");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", () => process.exit(status));
}