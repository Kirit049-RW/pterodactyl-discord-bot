module.exports = class Event {
    constructor(client, name, rest= false) {
        this.client = client
        this.name = name
        this.rest = rest
    }

    get logger() {
        return this.client.logger;
    }

    get slashLogger() {
        return this.client.slashLogger;
    }

    get database () {
        return this.client.database;
    }

    get config () {
        return this.client.config;
    }

    get utils() {
        return this.client.functions;
    }

    get messageFormatter() {
        return this.client.messageFormatter;
    }

    get emojiSuccess () {
        return this.client.emojiSuccess;
    }

    get emojiError () {
        return this.client.emojiError;
    }
}
