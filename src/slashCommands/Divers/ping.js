const SlashCommand = require('../../managers/structures/SlashCommands.js');
const { EmbedBuilder } = require('discord.js');

module.exports = class Ping extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'ping',
            description: 'Show the ping of the bot',
            description_localizations: {
                "fr": "Afficher le ping du bot"
            },
            category: SlashCommand.Categories.Divers,
            bot_permissions: ['EmbedLinks']
        });
    }

    async run (ctx) {
        const embed = new EmbedBuilder()
            .setTitle('Pong !')
            .setDescription(`:robot: La latence du bot est de **${Date.now() - ctx.inter.createdTimestamp} ms**\n:satellite: Le ping de l'api est de **${Math.round(ctx.client.ws.ping)} ms**`)
            .setColor(ctx.me.displayHexColor)

        ctx.send({ embeds: [embed] });
    }
}
