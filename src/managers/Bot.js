const { Client } = require("discord.js");

const Logger = require("./loggers/Logger");
const SlashLogger = require("./loggers/SlashLogger");

const EventsHandler = require("./handlers/EventsHandler");
const SlashCommandsHandler = require("./handlers/SlashCommandsHandler");
const PterodactylHandler = require("./handlers/PterodactylHandler");

const Functions = require("./utils/Functions");
const MessageFormatter = require("./utils/MessageFormatter");
const Database = require("./Database");

require('dotenv').config();

module.exports = class Bot extends Client {
    constructor(options) {
        super(options)
        this.config = require("../../config.json")

        this.logger = new Logger()
        this.slashLogger = new SlashLogger()

        this.functions = new Functions(this)
        this.messageFormatter = new MessageFormatter(this)

        this.eventsHandler = new EventsHandler(this)
        this.slashCommandsHandler = new SlashCommandsHandler(this)
        this.pterodactylHandler = new PterodactylHandler(this)

        this.database = new Database(this)

        this.emojiSuccess = '✅'
        this.emojiError = '❌'
    }
    async start() {
        await this.database.loadDatabase();
        await this.eventsHandler.loadEvents();
        await this.slashCommandsHandler.loadSlashCommands();
        await this.pterodactylHandler.loadPterodactyl();

        await this.login(process.env.TOKEN);
    }
}