const SlashCommand = require('../../../managers/structures/SlashCommands.js');

module.exports = class SuspendServer extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'suspend-server',
            description: 'Suspend a pterodactyl server',
            description_localizations: {
                "fr": "Suspendre un serveur pterodactyl"
            },
            options: [{
                name: "server",
                description: "The server id to suspend",
                description_localizations: {
                    "fr": "L'id du serveur à suspendre"
                },
                type: 4,
                required: true
            }],
            category: SlashCommand.Categories.ServerPterodactyl,
            user_permissions: ['Administrator']
        });
    }

    async run (ctx) {
        const serverId = ctx.options.getInteger('server');

        /* Check if the server exist */
        const server = await ctx.pterodactyl.app.getServerInfo(serverId).catch(() => null);
        if (!server) return ctx.error('Ce serveur pterodactyl n\'existe pas !');

        /* Check if the server is already suspended */
        if (server.suspended === true) return ctx.error('Ce serveur est déjà suspendu !');

        /* Suspend the server */
        ctx.pterodactyl.app.suspendServer(serverId)
            .then(() => {
                ctx.send({
                    content: `${ctx.emojiSuccess} Le serveur **${server.name}** a été suspendu !`
                })
            })
            .catch((e) => {
                ctx.error(`Une erreur est survenue lors de la suspension du serveur !\n${e}`);
            });
    }
}
