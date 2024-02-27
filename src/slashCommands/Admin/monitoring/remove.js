const SlashCommand = require('../../../managers/structures/SlashCommands.js');

module.exports = class MonitoringRemove extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'monitoring-remove',
            description: 'Remove a bot from the monitoring',
            description_localizations: {
                "fr": "Retirer un bot de la surveillance"
            },
            options: [{
                name: "bot",
                description: "The bot to remove",
                description_localizations: {
                    "fr": "Le bot à retirer"
                },
                type: 6,
                required: true
            }],
            category: SlashCommand.Categories.Admin,
            user_permissions: ['Administrator']
        });
    }

    async run (ctx) {
        const bot = ctx.options.getUser('bot');

        /* Check if the bot is a bot */
        if (!bot.bot) return ctx.error('Ce n\'est pas un bot !');

        /* Check if the bot is monitored */
        const monitoring = await ctx.database.table('monitoring').where('botId', bot.id);
        if (!monitoring[0]) return ctx.error('Ce bot n\'est pas surveillé !');

        /* Remove the bot from the monitoring */
        await ctx.database.table('monitoring').delete().where({ botId: bot.id });

        /* Send the success message */
        ctx.send({ content: `${ctx.emojiSuccess} Le bot ${bot} a été retiré de la surveillance !` });
    }
}
