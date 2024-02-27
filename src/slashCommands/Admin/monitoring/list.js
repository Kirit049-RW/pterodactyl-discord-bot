const SlashCommand = require('../../../managers/structures/SlashCommands.js');
const { EmbedBuilder } = require('discord.js');

module.exports = class MonitoringList extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'monitoring-list',
            description: 'Display the list of all bots monitor',
            description_localizations: {
                "fr": "Afficher la liste des bots surveiller"
            },
            category: SlashCommand.Categories.Admin,
            user_permissions: ['Administrator'],
            bot_permissions: ['EmbedLinks']
        });
    }

    async run (ctx) {
        const monitoring = await ctx.database.table('monitoring');
        if (!monitoring[0]) return ctx.error('Aucun bot n\'est surveillé !');

        const embed = new EmbedBuilder()
            .setTitle('Liste des bots surveillés')
            .setColor(ctx.me.displayHexColor)
            .setThumbnail(ctx.me.displayAvatarURL())
            .setDescription(monitoring.map(m => `• ${ctx.getMember(m.botId) ? `${ctx.getMember(m.botId)} - \`${m.botId}\`` : `\`${m.botId}\``} depuis <t:${Math.floor(m.createdAt / 1000)}:R>`).join('\n'))

        ctx.send({ embeds: [embed] });
    }
}
