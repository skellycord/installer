import { REPO, blue } from "./utils.js";
import axios from "axios";
import { existsSync, readdirSync, rmSync, } from "fs";
import { homedir } from "os";
import { join } from "path";

const { env, platform } = process;

const MACOS_PARTIAL_PATH = ["Library", "Application Support"];
const LINUX_PARTIAL_PATH = [".config"];
const FLATPAK_PARTIAL_PATH = [".var", "app", "com.discordapp.Discord", "config", "discord"];

export function findPath(target) {
    let suffix = target !== "stable" ? target : "";
    let appDir;
    switch (platform) {
        case "win32":
            if (suffix.length) {
                const suffixSplit = suffix.split("");
                suffixSplit[0] = suffixSplit[0].toUpperCase();
                suffix = suffixSplit.join("");
            }

            appDir = join(env.LOCALAPPDATA, "Discord" + suffix);
            break;
        case "darwin":
            appDir = join(homedir(), ...MACOS_PARTIAL_PATH, "discord" + suffix);
            break;
        case "linux":
            const LINUX_CONFIG = join(homedir(), ...LINUX_PARTIAL_PATH, "discord" + suffix);
            if (existsSync(LINUX_CONFIG)) appDir = LINUX_CONFIG;
            else appDir = join(homedir(), ...FLATPAK_PARTIAL_PATH);
    }

    if (!existsSync(appDir)) throw new ReferenceError("No discord path found.");

    const appVersion = readdirSync(appDir)
        .filter(d => !d.includes("ico"))
        .find(d => d.startsWith("app") || /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/.test(d));

    let desktopCoreDir = join(appDir, appVersion, "modules");
    if (platform === "win32") desktopCoreDir = join(
        desktopCoreDir,
        readdirSync(desktopCoreDir).find(f => f.includes("discord_desktop_core"))
    );

    return join(desktopCoreDir, "discord_desktop_core");
}

export async function downloadAsar() {
    const res = await axios.get(`https://raw.githubusercontent.com/${REPO}/dist/skellycord.asar`);

    return String(res.data);
}

export function deleteAsar(corePath) {
    if (existsSync(join(corePath, "skellycord.asar"))) {
        blue("Deleting skellycord.asar from desktop core...");
        try {
            rmSync(join(corePath, "skellycord.asar"));
        }
        catch (e) {
            if (e.message.includes("resource busy")) red("Failed to delete skellycord.asar, close discord and try again.");
        }
    }
}
