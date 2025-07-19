# termhunt-cli

A beautiful CLI tool for fetching and executing Makefile-like scripts from the [termhunt](https://termhunt.vercel.app) app. Supports colored output, ticks/crosses, and multi-step commands with directory changes.

## Features

- Fetches commands from the termhunt API
- Executes multi-line scripts step-by-step
- Handles `cd` commands and runs subsequent commands in the correct directory
- Beautiful, colored output with success and error indicators

## Installation

```sh
npm install -g termhunt-cli
```

## Usage

```sh
hunt <app-identifier>
```

Example:

```sh
hunt test-termhunt
```

## How it works

- Fetches a script from the API for the given app identifier
- Prints each command before running it
- Handles directory changes (`cd ...`) so subsequent commands run in the right place
- Shows ticks (✔) for success and crosses (✖) for errors

## Requirements

- Node.js v18 or newer

## License

MIT
