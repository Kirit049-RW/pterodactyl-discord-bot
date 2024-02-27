const SlashCommand = require('../../../managers/structures/SlashCommands.js');
const ms = require('ms');
const schedule = require('node-schedule');

module.exports = class UnsuspendServer extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'unsuspend-server',
            description: 'Unsuspend a pterodactyl server',
            description_localizations: {
                "fr": "Lever la suspension d\'un serveur pterodactyl"
            },
            options: [{
                name: "server",
                description: "The server id to unsuspend",
                description_localizations: {
                    "fr": "L'id du serveur à lever la suspension"
                },
                type: 4,
                required: true
            }, {
                name: 'time',
                name_localizations: {
                    "fr": "temps",
                },
                description: 'Time to suspend the server in day',
                description_localizations: {
                    "fr": "Temps à suspendre le serveur en jour",
                },
                type: 3,
                required: false
            }],
            category: SlashCommand.Categories.ServerPterodactyl,
            user_permissions: ['Administrator']
        });
    }

    async run (ctx) {
        const serverId = ctx.options.getInteger('server');
        const time = ctx.options.getString('time') || null;

        /* Check if the time contain the letter d */
        if (time && !time.includes('d')) return ctx.error('Le temps doit être en jour !');

        /* Check if the time is correct */
        if (time && !ms(time)) return ctx.error('Le temps est incorrect !');

        /* Check if the server exist */
        const server = await ctx.pterodactyl.app.getServerInfo(serverId).catch(() => null);
        if (!server) return ctx.error('Ce serveur pterodactyl n\'existe pas !');

        /* Check if the server is suspended */
        if (server.suspended === false) return ctx.error('Ce serveur n\'est pas suspendu !');

        /* Suspend the server */
        ctx.pterodactyl.app.unSuspendServer(serverId)
            .then(async () => {
                ctx.send({
                    content: `${ctx.emojiSuccess} Le serveur **${server.name}** n\'est plus suspendu !`
                });

                if (time) {
                    const timing = Date.now() + ms(time);

                    /* Add to database */
                    await ctx.database.table('schedule_servers').insert({
                        serverId: server.id,
                        time: timing
                    });

                    schedule.scheduleJob(`${server.id}`, timing, async () => {
                        /* Suspend the server */
                        ctx.pterodactyl.app.suspendServer(server.id)
                            .then(async () => {
                                ctx.client.logger.warn(`Schedule Suspend Server : ${server.name} (${server.id})`);

                                /* Delete from database */
                                await ctx.database.table('schedule_servers').delete().where('serverId', server.id);
                            })
                            .catch((e) => {
                                ctx.client.logger.error(`Schedule Create Server Error : ${e}`);
                            });
                    });
                }
            })
            .catch((e) => {
                ctx.error(`Une erreur est survenue lors de la suppression de la suspension du serveur !\n${e}`);
            });
    }
}
