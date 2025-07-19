#!/usr/bin/env node

let chalk;
const fetch = require("node-fetch");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const API_BASE = "http://termhunt.vercel.app/api/apps";

async function main() {
  if (!chalk) {
    chalk = (await import("chalk")).default;
  }
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error(chalk.bgBlue.white.bold(" Usage: hunt <app-identifier> "));
    process.exit(1);
  }
  const appId = args[0];
  const url = `${API_BASE}/${appId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch Makefile: ${res.statusText}`);
    const resJson = await res.json();
    if (!resJson.makefile) throw new Error("No makefile found in response.");
    const makefileCommand = resJson.makefile;
    console.log(
      chalk.bgBlue.white.bold("\n Executing commands from API: \n") +
        chalk.blueBright(makefileCommand) +
        "\n"
    );
    // Split commands by newlines and run sequentially
    const commands = makefileCommand.split(/\r?\n/).filter(Boolean);
    const tick = chalk.green.bold("✔");
    const cross = chalk.red.bold("✖");
    let currentDir = process.cwd();
    async function runCommands(cmds, i = 0) {
      if (i >= cmds.length) {
        console.log(
          chalk.bgGreen.white.bold(
            `\n${tick} All commands executed successfully!\n`
          )
        );
        return;
      }
      const cmdLine = cmds[i].trim();
      // Handle 'cd' command specially
      if (/^cd\s+/.test(cmdLine)) {
        const targetDir = cmdLine.replace(/^cd\s+/, "").trim();
        // If relative, resolve from currentDir
        currentDir = path.isAbsolute(targetDir)
          ? targetDir
          : path.resolve(currentDir, targetDir);
        console.log(
          chalk.bgBlue.white.bold(`\n→ Changed directory to: ${currentDir}`)
        );
        console.log(chalk.green(`${tick} Success: ${cmdLine}`));
        runCommands(cmds, i + 1);
        return;
      }
      const parts = cmdLine.split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);
      console.log(chalk.bgBlue.white.bold(`\n→ Running: ${cmdLine}`));
      const child = spawn(cmd, args, {
        stdio: "inherit",
        shell: true,
        cwd: currentDir,
      });
      child.on("exit", (code) => {
        if (code !== 0) {
          console.error(
            chalk.bgRed.white.bold(`\n${cross} Command failed: ${cmdLine}`)
          );
          process.exit(code);
        } else {
          console.log(chalk.green(`${tick} Success: ${cmdLine}`));
          runCommands(cmds, i + 1);
        }
      });
    }
    runCommands(commands);
  } catch (e) {
    if (!chalk) {
      chalk = (await import("chalk")).default;
    }
    console.error(
      chalk.bgRed.white.bold(`\n${chalk.red.bold("✖")} Error: ${e.message}`)
    );
    process.exit(1);
  }
}

main();
