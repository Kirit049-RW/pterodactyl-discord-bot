const SlashCommand = require('../../../managers/structures/SlashCommands.js');
const { EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = class GetUsers extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'get-users',
            description: 'Get all users registered on the pterodactyl panel',
            description_localizations: {
                "fr": "Afficher tous les utilisateurs enregistrés sur le panel pterodactyl"
            },
            category: SlashCommand.Categories.UserPterodactyl,
            user_permissions: ['Administrator'],
            bot_permissions: ['EmbedLinks']
        });
    }

    async mainEmbed (ctx, usersList, usersLength, users) {
        /* Check if we have the discord user registered */
        const linkUsersToDiscord = usersList.map((user) => {
            const exist = users.find((u) => u.pterodactylId === user.attributes.id)
            if (exist) return `<@${exist.discordId}>`
            else return '\`Aucun\`'
        })

        return new EmbedBuilder()
            .setTitle(`Comptes utilisateurs (${usersLength})`)
            .setColor(ctx.me.displayHexColor)
            .setThumbnail(ctx.me.user.displayAvatarURL())
            .addFields(usersList.map((user) => {
                return {
                    name: `${user.attributes.username}`,
                    value: `Discord : ${linkUsersToDiscord[usersList.indexOf(user)]}\nPtero Id : \`${user.attributes.id}\`\nAdmin : ${user.attributes.root_admin?ctx.emojiSuccess:ctx.emojiError}\nA2F : ${user.attributes["2fa"]?ctx.emojiSuccess:ctx.emojiError}\nServeur${user.attributes.relationships.servers.data.length>1?"s":""} : \`${user.attributes.relationships.servers.data.length}\`\nCrée : <t:${Math.round(new Date(user.attributes.created_at).getTime()/ 1000).toFixed()}:d>`,
                    inline: true
                }
            }))
    }

    selectMenu (usersList) {
        return new StringSelectMenuBuilder()
            .setCustomId('get-users')
            .setPlaceholder('Choisir un utilisateur')
            .addOptions([{
                label: 'Page principale',
                value: 'main',
                emoji: '🏠'
            }])
            .addOptions(usersList
                .filter((u) => u.attributes.relationships.servers.data.length > 0)
                .map((user) => {
                    return {
                        label: user.attributes.username,
                        value: String(user.attributes.id),
                        emoji: '👤'
                    }
            }))
    }

    async run (ctx) {
        /* Get all users registered in the database & on pterodactyl */
        const usersDatabase = await ctx.database.table('users').select();
        const users = await ctx.pterodactyl.app.getAllUsers({
            servers: true
        });

        /* Check if there is at least one user */
        if (!users[0]) return ctx.error('Aucun utilisateur n\'est actuellement créé !');

        const usersList = ctx.utils.getNumberPacket(users, 10);
        let page = 1;
        let msg;

        const filter = (button) => button.user.id === ctx.user.id;

        if (usersList.length === 1) {
            msg = await ctx.send({
                embeds: [await this.mainEmbed(ctx, usersList[page - 1], users.length, usersDatabase)],
                components: [{
                    type: 1,
                    components: [this.selectMenu(usersList[page - 1])]
                }]
            });
        }
        else {
            const component1 = ctx.messageFormatter.pages(`Page ${page}/${usersList.length}`, page, usersList.length);
            const component2 = [{
                type: 1,
                components: [this.selectMenu(usersList[page - 1])]
            }];

            const components = component1.concat(component2);
            msg = await ctx.send({
                embeds: [await this.mainEmbed(ctx, usersList[page - 1], users.length, usersDatabase)],
                components: components
            });

            const collectorSendButton = msg.createMessageComponentCollector({ filter, idle: 5 * 60 * 1000, componentType: 2});

            collectorSendButton.on('collect', async (button) => {
                if (!["left", "right"].includes(button.customId)) return

                await button.deferUpdate();
                button.customId === "left" ? page-- : page++;

                const component1 = ctx.messageFormatter.pages(`Page ${page}/${usersList.length}`, page, usersList.length);
                const component2 = [{
                    type: 1,
                    components: [this.selectMenu(usersList[page - 1])]
                }];
                const components = component1.concat(component2);

                return msg.edit({
                    embeds: [await this.mainEmbed(ctx, usersList[page - 1], users.length, usersDatabase)],
                    components: components
                }).catch(() => null);
            });
        }

        const collectorSelectMenu = msg.createMessageComponentCollector({ filter, idle: 5 * 60 * 1000, componentType: 3});

        collectorSelectMenu.on('collect', async (menu) => {
            await menu.deferUpdate();
            const value = menu.values[0];

            if (value === 'main') {
                return msg.edit({
                    embeds: [await this.mainEmbed(ctx, usersList[page - 1], users.length, usersDatabase)],
                    components: [...menu.message.components]
                }).catch(() => null);
            }
            else {
                /* Get user's information */
                const user = users.find((u) => u.attributes.id === Number(value));
                const servers = user.attributes.relationships.servers.data;

                /* Get the discord user registered */
                let discordInfo = usersDatabase.find((u) => u.pterodactylId === user.attributes.id);
                discordInfo = discordInfo ? `<@${discordInfo.discordId}> (\`${discordInfo.discordId}\`)` : '\`Aucun\`';

                const embed = new EmbedBuilder()
                    .setTitle(`Compte utilisateur ${user.attributes.username}`)
                    .setColor(ctx.me.displayHexColor)
                    .setThumbnail(ctx.me.user.displayAvatarURL())
                    .setDescription(`Discord : ${discordInfo}`)
                    .addFields(servers.map((server) => {
                        return {
                            name: `${server.attributes.name}`,
                            value: `Id : \`${server.attributes.id}\`\nSuspendu : ${server.attributes.suspended ?ctx.emojiSuccess:ctx.emojiError}\nDatabase : \`${server.attributes.feature_limits.databases}\`\nBackup : \`${server.attributes.feature_limits.backups}\`\nRAM : \`${server.attributes.limits.memory} MB\`\nDisque : \`${server.attributes.limits.disk} MB\`\nCrée : <t:${Math.round(new Date(server.attributes.created_at).getTime()/ 1000).toFixed()}:d>`,
                            inline: true
                        }
                    }))

                return msg.edit({
                    embeds: [embed]
                }).catch(() => null);
            }
        });

        collectorSelectMenu.on('end', async (_, reason) => {
            if (reason === "idle") return msg.edit({components: []}).catch(() => null);
        });
    }
}
