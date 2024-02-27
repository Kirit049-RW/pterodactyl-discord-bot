const SlashCommand = require('../../../managers/structures/SlashCommands.js');

module.exports = class MonitoringAdd extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'monitoring-add',
            description: 'Add a bot to the monitoring',
            description_localizations: {
                "fr": "Ajouter un bot à la surveillance"
            },
            options: [{
                name: "bot",
                description: "The bot to monit",
                description_localizations: {
                    "fr": "Le bot à surveiller"
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

        /* Check if the bot is this bot */
        if (bot.id === ctx.client.user.id) return ctx.error('Je ne peux pas me surveiller moi-même !');

        /* Check if the bot is on the server */
        const botMember = ctx.getMember(bot.id);
        if (!botMember) return ctx.error('Ce bot n\'est pas sur le serveur !');

        /* Check if the bot is already monitored */
        const monitoring = await ctx.database.table('monitoring').where('botId', bot.id);
        if (monitoring[0]) return ctx.error('Ce bot est déjà surveillé !');

        /* Add the bot to the monitoring */
        await ctx.database.table('monitoring').insert({
            botId: bot.id,
            createdAt: Date.now()
        });

        /* Send the success message */
        ctx.send({ content: `${ctx.emojiSuccess} Le bot ${bot} a été ajouté à la surveillance !` });
    }
}
