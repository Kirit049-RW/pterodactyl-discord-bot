const SlashCommand = require('../../../managers/structures/SlashCommands.js');
const { EmbedBuilder } = require('discord.js');

module.exports = class GetAllServers extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'get-servers',
            description: 'Get all servers created on the pterodactyl panel',
            description_localizations: {
                "fr": "Afficher tous les serveurs créés sur le panel pterodactyl"
            },
            category: SlashCommand.Categories.ServerPterodactyl,
            user_permissions: ['Administrator'],
            bot_permissions: ['EmbedLinks']
        });
    }

    async mainEmbed (ctx, serversList, serversLength, users) {
        /* Check if we have the discord user registered */
        const linkUsersToDiscord = serversList.map((user) => {
            const exist = users.find((u) => u.pterodactylId === user.attributes.relationships.user.attributes.id)
            if (exist) return `<@${exist.discordId}>`
            else return '\`Aucun\`'
        })

        return new EmbedBuilder()
            .setTitle(`Serveurs (${serversLength})`)
            .setColor(ctx.me.displayHexColor)
            .setThumbnail(ctx.me.user.displayAvatarURL())
            .addFields(serversList.map((server) => {
                return {
                    name: `${server.attributes.name}`,
                    value: `Discord : ${linkUsersToDiscord[serversList.indexOf(server)]}\nUsername : **${server.attributes.relationships.user.attributes.username}**\nPtero Id : \`${server.attributes.id}\`\nSuspendu : ${server.attributes.suspended ?ctx.emojiSuccess:ctx.emojiError}\nDatabase : \`${server.attributes.feature_limits.databases}\`\nBackup : \`${server.attributes.feature_limits.backups}\`\nRAM : \`${server.attributes.limits.memory} MB\`\nDisque : \`${server.attributes.limits.disk} MB\`\nCrée : <t:${Math.round(new Date(server.attributes.created_at).getTime()/ 1000).toFixed()}:d>`,
                    inline: true
                }
            }))
    }

    async run (ctx) {
        /* Get all users registered in the database & all servers created on pterodactyl */
        const usersDatabase = await ctx.database.table('users').select();
        const servers = await ctx.pterodactyl.app.getAllServers({
            user: true
        });

        /* Check if there is at least one server */
        if (!servers[0]) return ctx.error('Aucun serveur n\'est actuellement créé !');

        const serversList = ctx.utils.getNumberPacket(servers, 10);
        let page = 1;
        let msg;

        const filter = (button) => button.user.id === ctx.user.id;

        if (serversList.length === 1) {
            msg = await ctx.send({
                embeds: [await this.mainEmbed(ctx, serversList[page - 1], servers.length, usersDatabase)]
            });
        }
        else {
            msg = await ctx.send({
                embeds: [await this.mainEmbed(ctx, serversList[page - 1], servers.length, usersDatabase)],
                components: ctx.messageFormatter.pages(`Page ${page}/${serversList.length}`, page, serversList.length)
            });

            const collectorSendButton = msg.createMessageComponentCollector({ filter, idle: 5 * 60 * 1000, componentType: 2});

            collectorSendButton.on('collect', async (button) => {
                if (!["left", "right"].includes(button.customId)) return

                await button.deferUpdate();
                button.customId === "left" ? page-- : page++;

                return msg.edit({
                    embeds: [await this.mainEmbed(ctx, serversList[page - 1], servers.length, usersDatabase)],
                    components: ctx.messageFormatter.pages(`Page ${page}/${serversList.length}`, page, serversList.length)
                }).catch(() => null);
            });

            collectorSendButton.on('end', async (_, reason) => {
                if (reason === "idle") return msg.edit({components: []}).catch(() => null);
            });
        }
    }
}
