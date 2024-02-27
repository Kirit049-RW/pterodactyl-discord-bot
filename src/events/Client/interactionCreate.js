const Events = require('../../managers/structures/Events');
const SlashCommandsService = require('../../services/Client/SlashCommandsService.js');

module.exports = class InteractionCreate extends Events {
    constructor (client) {
        super(client, 'interactionCreate')
        this.slashCommandsService = new SlashCommandsService(this)
    }

    async handle (inter) {
        /* Slash Commands */
        await this.slashCommandsService.handle(inter);
    }
}
