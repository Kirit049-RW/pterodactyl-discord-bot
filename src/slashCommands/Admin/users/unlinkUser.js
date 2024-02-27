const SlashCommand = require('../../../managers/structures/SlashCommands.js');

module.exports = class UnlinkUser extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'unlink-user',
            description: 'Unlink a discord user to a pterodactyl user',
            description_localizations: {
                "fr": "Délier un utilisateur discord à un utilisateur pterodactyl"
            },
            options: [{
                name: 'type',
                description: 'Type of the data',
                description_localizations: {
                    "fr": "Type de la donnée"
                },
                type: 3,
                required: true,
                choices: [{
                    name: 'Discord',
                    value: 'discord'
                }, {
                    name: 'Pterodactyl',
                    value: 'pterodactyl'
                }]
            }, {
                name: 'discord',
                description: 'Discord user to unlink',
                description_localizations: {
                    "fr": "Utilisateur discord à délier"
                },
                type: 6,
                required: false
            }, {
                name: 'pterodactyl',
                description: 'Pterodactyl user to unlink',
                description_localizations: {
                    "fr": "Utilisateur pterodactyl à délier"
                },
                type: 4,
                required: false,
                min_value: 1
            }],
            category: SlashCommand.Categories.UserPterodactyl,
            user_permissions: ['Administrator']
        });
    }

    async run (ctx) {
        const type = ctx.options.getString('type');
        const userDiscord = ctx.options.getUser('discord') || null;
        const userPterodactyl = ctx.options.getInteger('pterodactyl') || null;

        /* Check if data is provided */
        if (!userDiscord && !userPterodactyl) return ctx.error('Vous devez fournir un utilisateur discord ou un utilisateur pterodactyl !');

        /* Check if 2 data are provided */
        if (userDiscord && userPterodactyl) return ctx.error('Vous devez fournir un utilisateur discord ou un utilisateur pterodactyl, pas les deux !');

        if (type === 'discord') {
            /* Check if a valid discord user is provided */
            if (!userDiscord) return ctx.error('Vous devez fournir un utilisateur discord !');

            /* Check if this discord user exist */
            const userDiscordExist = await ctx.database.table('users').select().where('discordId', userDiscord.id);
            if (!userDiscordExist[0]) return ctx.error('Cet utilisateur discord n\'est pas attribué à un utilisateur pterodactyl !');

            /* Delete in the database */
            await ctx.database.table('users').delete().where('discordId', userDiscord.id);

            /* Send success message */
            ctx.send({
                content: `${ctx.emojiSuccess} L'utilisateur discord <@${userDiscord.id}> a bien été délié de l'utilisateur pterodactyl \`${userDiscordExist[0].pterodactylUserId}\` !`
            });
        }
        else if (type === 'pterodactyl') {
            /* Check if a valid pterodactyl user is provided */
            if (!userPterodactyl) return ctx.error('Vous devez fournir un utilisateur pterodactyl !');

            /* Check if this pterodactyl user exist */
            const userPterodactylExist = await ctx.database.table('users').select().where('pterodactylId', userPterodactyl);
            if (!userPterodactylExist[0]) return ctx.error('Cet utilisateur pterodactyl n\'est pas attribué à un utilisateur discord !');

            /* Delete in the database */
            await ctx.database.table('users').delete().where('pterodactylId', userPterodactyl);

            /* Send success message */
            ctx.send({
                content: `${ctx.emojiSuccess} L'utilisateur pterodactyl \`${userPterodactyl}\` a bien été délié de l'utilisateur discord <@${userPterodactylExist[0].discordUserId}> !`
            });
        }
    }
}
