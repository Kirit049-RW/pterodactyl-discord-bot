const SlashCommand = require('../../../managers/structures/SlashCommands.js');

module.exports = class DeleteUser extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'delete-user',
            description: 'Delete a user from the pterodactyl panel',
            description_localizations: {
                "fr": "Supprimer un utilisateur du panel pterodactyl"
            },
            options: [{
                name: 'pterodactyl',
                description: 'Pterodactyl Id of the user to delete',
                description_localizations: {
                    "fr": "Id pterodactyl de l'utilisateur à supprimer"
                },
                type: 4,
                required: true
            }],
            category: SlashCommand.Categories.UserPterodactyl,
            user_permissions: ['Administrator']
        });
    }

    async run (ctx) {
        const pterodactylId = ctx.options.getInteger('pterodactyl');

        /* Check if this pterodactyl user exist */
        const userPterodactylExist = await ctx.pterodactyl.app.getUserInfo(pterodactylId, {
            servers: true
        }).catch(() => null);

        if (!userPterodactylExist) return ctx.error('Cet utilisateur pterodactyl n\'existe pas !');

        /* Protect admin user */
        if (userPterodactylExist.root_admin) return ctx.error('Cet utilisateur est un administrateur, il ne peut donc pas être supprimé !');

        /* Check if the user has servers */
        if (userPterodactylExist.relationships.servers.data.length > 0) return ctx.error('Cet utilisateur possède des serveurs, il ne peut donc pas être supprimé !');

        /* Delete the user */
        ctx.pterodactyl.app.deleteUser(pterodactylId)
            .then(async () => {
                await ctx.send({
                    content: `${ctx.emojiSuccess} L'utilisateur a bien été supprimé !`
                });

                /* Delete the user from the database */
                const userDatabase = await ctx.database.table('users').select().where('pterodactylId', pterodactylId);
                if (userDatabase[0]) await ctx.database.table('users').delete().where('pterodactylId', pterodactylId);
            })
            .catch(() => {
                return ctx.error('Une erreur est survenue lors de la suppression de l\'utilisateur !');
            });
    }
}
