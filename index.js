#!/usr/bin/env node

const fetch = require("node-fetch");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const API_BASE = "http://termhunt.vercel.app/api/apps";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: hunt <app-identifier>");
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
    console.log("Executing command from API:", makefileCommand);
    exec(makefileCommand, (err, stdout, stderr) => {
      if (err) {
        console.error("Error running command:", stderr);
        process.exit(1);
      }
      console.log(stdout);
    });
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}

main();
