const SlashCommand = require('../../../managers/structures/SlashCommands.js');

module.exports = class DeleteServer extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'delete-server',
            description: 'Delete a pterodactyl server',
            description_localizations: {
                "fr": "Supprimer un serveur pterodactyl"
            },
            options: [{
                name: "server",
                description: "The server id to delete",
                description_localizations: {
                    "fr": "L'id du serveur à supprimer"
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

        /* Delete the server */
        ctx.pterodactyl.app.deleteServer(serverId)
            .then(() => {
                ctx.send({
                    content: `${ctx.emojiSuccess} Le serveur **${server.name}** a été supprimé !`
                })
            })
            .catch((e) => {
                ctx.error(`Une erreur est survenue lors de la suppression du serveur !\n${e}`);
            });
    }
}
