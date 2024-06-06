const [, , command, version ] = process.argv;
import { downloadAndCopy, preExit } from "./installer.mjs";
import { inject, uninject } from "./injectorFuncs/index.js";
import { blue, deleteAsar, red } from "./utils.js";

const VALID_COMMANDS = [
    "inject",
    "uninject"
];

blue("SKELLYCORD INSTALLER - ONESHOT", true);

(function() {
    if (!VALID_COMMANDS.includes(command) || (!version || !["stable", "ptb", "canary"].includes(version))) {
        red("Invalid input: skellycord-installer <inject|uninject> <stable|ptb|canary>", true, "!");
        preExit(1);
        return;
    }

    switch (command) {
        case "inject":
            inject(
                version,
                downloadAndCopy,
                preExit
            );
            break;
        case "uninject":
            uninject(
                version,
                deleteAsar,
                preExit
            );
    }
})();