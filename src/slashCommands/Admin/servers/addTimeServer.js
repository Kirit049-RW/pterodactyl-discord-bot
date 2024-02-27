const SlashCommand = require('../../../managers/structures/SlashCommands.js');
const ms = require('ms');
const schedule = require('node-schedule');

module.exports = class AddTimeServer extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'add-time-server',
            description: 'Add time to a pterodactyl server',
            description_localizations: {
                "fr": "Ajouter du temps à un serveur pterodactyl"
            },
            options: [{
                name: "server",
                description: "The server id to add time",
                description_localizations: {
                    "fr": "L'id du serveur à ajouter du temps"
                },
                type: 4,
                required: true
            }, {
                name: 'time',
                name_localizations: {
                    "fr": "temps",
                },
                description: 'Time to add to the server in day',
                description_localizations: {
                    "fr": "Temps à ajouter au serveur en jour",
                },
                type: 3,
                required: true
            }],
            category: SlashCommand.Categories.ServerPterodactyl,
            user_permissions: ['Administrator']
        });
    }

    async run (ctx) {
        const serverId = ctx.options.getInteger('server');
        const time = ctx.options.getString('time');

        /* Check if the time contain the letter d */
        if (!time.includes('d')) return ctx.error('Le temps doit être en jour !');

        /* Check if the time is correct */
        if (!ms(time)) return ctx.error('Le temps est incorrect !');

        /* Check if the server exist */
        const server = await ctx.pterodactyl.app.getServerInfo(serverId).catch(() => null);
        if (!server) return ctx.error('Ce serveur pterodactyl n\'existe pas !');

        /* Get the database */
        const serverDatabase = await ctx.database.table('schedule_servers').select().where({ serverId: server.id });
        let timing

        if (serverDatabase[0]) {
            timing = serverDatabase[0].time + ms(time);

            /* Add to database */
            await ctx.database.table('schedule_servers').update({
                time: timing
            }).where({ serverId: server.id });

            /* Get the old schedule */
            const oldSchedule = schedule.scheduledJobs[`${server.id}`];

            /* Cancel the old schedule */
            if (oldSchedule) oldSchedule.cancel();

            /* Send a success message */
            ctx.send({
                content: `${ctx.emojiSuccess} Le temps du serveur **${server.name}** a été mis à jour ! Il est passé du <t:${Math.floor(serverDatabase[0].time / 1000)}:d> au <t:${Math.floor(timing / 1000)}:d>.`
            });
        }
        else {
            timing = Date.now() + ms(time);

            /* Add to database */
            await ctx.database.table('schedule_servers').insert({
                serverId: server.id,
                time: timing
            });

            /* Send a success message */
            ctx.send({
                content: `${ctx.emojiSuccess} Le temps du serveur **${server.name}** a été créé ! Il est configuré jusq'au <t:${Math.floor(timing / 1000)}:d>.`
            });
        }

        /* Create schedule */
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
}
