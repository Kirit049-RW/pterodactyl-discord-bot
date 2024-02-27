const chalk = require("chalk");
const moment = require("moment");

module.exports = class Logger {
    log = (content, type = "log") => {
        const timestamp = `[${moment().format("DD-MM-YYYY HH:mm:ss")}] :`;
        switch (type) {
            case "log": {
                return console.log(chalk.blue.bold(`${timestamp} ${chalk.white(type.toUpperCase())} ${content}`));
            }
            case "warn": {
                return console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content}`);
            }
            case "error": {
                return console.log(chalk.red.bold(`${timestamp} ${chalk.white(type.toUpperCase())} ${content}`));
            }
            case "debug": {
                return console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content}`);
            }
            case "cmd": {
                return console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
            }
            case "ready": {
                console.log(chalk.gray("—————————————————————————————————"));
                console.log(chalk.magenta.bold(`${timestamp} ${chalk.black.greenBright(type.toUpperCase())} ${content}`));
                return console.log(chalk.gray("—————————————————————————————————"));
            }
            case "lang": {
                return console.log(chalk.cyan.bold(`${timestamp} ${chalk.white(type.toUpperCase())} ${content}`));
            }
            default:
                throw new Error(
                    "Logger type must be either warn, debug, log, ready, cmd or error."
                );
        }
    };

    warn = (...args) => this.log(...args, "warn");

    error = (...args) => this.log(...args, "error");

    debug = (...args) => this.log(...args, "debug");

    cmd = (...args) => this.log(...args, "cmd");

    ready = (...args) => this.log(...args, "ready");

    lang = (...args) => this.log(...args, "lang");
}