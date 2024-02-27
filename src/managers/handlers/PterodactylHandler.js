const { Application, Client } = require("@linux123123/jspteroapi");

module.exports = class PterodactylHandler {
    constructor(client) {
        this.client = client;
        this.config = client.config;
        this.client.pterodactyl = {};
    }

    async loadPterodactyl () {
        this.client.pterodactyl.app = new Application(`${this.config["pterodactyl"]["url"]}`, `${this.config["pterodactyl"]["apiKeyApp"]}`);
        this.client.pterodactyl.client = new Client(`${this.config["pterodactyl"]["url"]}`, `${this.config["pterodactyl"]["apiKeyClient"]}`);
    }
}