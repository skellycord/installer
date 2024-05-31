import { existsSync, mkdirSync, readdirSync, rmSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { env, platform } from "process";

// whats chalk
const makeLog = (string, color, bold=false, prefix="|") => console.log(`${bold ? "\x1b[1m" : ""}\x1b[${color}m${prefix}\x1b[0m${bold ? "\x1b[1m" : ""} ${string} ${bold ? "\x1b[0m" : ""}`);
export function green(string, bold=false, prefix="|") { return makeLog(string, "32", bold, prefix); }
export function red(string, bold=false, prefix="|") { return makeLog(string, "31", bold, prefix); }
export function blue(string, bold=false, prefix="|") { return makeLog(string, "34", bold, prefix); }
export function yellow(string, bold=false, prefix="|") { return makeLog(string, "33", bold, prefix); }

export const REPO = "skellycord/skellycord";
export const NIGHTLY_RELEASE_ID = "150324270";
export const TYPE_FLAGS = ["-stable", "-ptb", "-canary"];

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