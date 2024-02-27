const SlashCommand = require('../../../managers/structures/SlashCommands.js');

module.exports = class LinkUser extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'link-user',
            description: 'Link a discord user to a pterodactyl user',
            description_localizations: {
                "fr": "Lier un utilisateur discord à un utilisateur pterodactyl"
            },
            options: [{
                name: 'discord',
                description: 'Discord user to link',
                description_localizations: {
                    "fr": "Utilisateur discord à lier"
                },
                type: 6,
                required: true
            }, {
                name: 'pterodactyl',
                description: 'Pterodactyl user to link',
                description_localizations: {
                    "fr": "Utilisateur pterodactyl à lier"
                },
                type: 4,
                required: true,
                min_value: 1
            }],
            category: SlashCommand.Categories.UserPterodactyl,
            user_permissions: ['Administrator']
        });
    }

    async run (ctx) {
        const userDiscord = ctx.options.getUser('discord');
        const userPterodactyl = ctx.options.getInteger('pterodactyl');

        /* Check if this discord user is a bot */
        if (userDiscord.bot) return ctx.error('Vous ne pouvez pas lier un bot !');

        /* Check if this pterodactyl user is already attributed with another discord user */
        const userPterodactylAlreadyExist = await ctx.database.table('users').select().where('pterodactylId', userPterodactyl);
        if (userPterodactylAlreadyExist[0]) return ctx.error('Cet utilisateur pterodactyl est déjà attribué à un utilisateur discord !');

        /* Check if this discord user is already attributed with another pterodactyl user */
        const userDiscordAlreadyExist = await ctx.database.table('users').select().where('discordId', userDiscord.id);
        if (userDiscordAlreadyExist[0]) return ctx.error('Cet utilisateur discord est déjà attribué à un utilisateur pterodactyl !');

        /* Check if this pterodactyl user exist */
        const userPterodactylExist = await ctx.pterodactyl.app.getUserInfo(userPterodactyl).catch(() => null);
        if (!userPterodactylExist) return ctx.error('Cet utilisateur pterodactyl n\'existe pas !');

        /* Add in the database */
        await ctx.database.table('users').insert({
            discordId: userDiscord.id,
            pterodactylId: userPterodactyl
        });

        /* Send success message */
        ctx.send({
            content: `${ctx.emojiSuccess} L'utilisateur discord ${userDiscord} a bien été lié à l'utilisateur pterodactyl \`${userPterodactyl}\` !`
        });
    }
}
