const Bot = require("./src/managers/Bot.js");
const { GatewayIntentBits, Partials } = require("discord.js");
const chalk = require('chalk');

const client = new Bot({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [
        Partials.User,
        Partials.GuildMember
    ],
    allowedMentions: {parse: ['users', 'roles']},
    presence: {
        status: 'invisible'
    }
});

process.on("unhandledRejection", async(reason, p) => {
    console.log(p);
});
process.on("uncaughtException", async(err, origin) => {
    console.log(chalk.gray("—————————————————————————————————"));
    console.log(
        chalk.white("["),
        chalk.red.bold("AntiCrash"),
        chalk.white("]"),
        chalk.gray(" : "),
        chalk.white.bold("Uncaught Exception/Catch")
    );
    console.log(chalk.gray("—————————————————————————————————"));
    console.log(err, origin);
});

client.start().then(() => {});
