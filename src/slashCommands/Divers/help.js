const SlashCommand = require('../../managers/structures/SlashCommands.js');
const { EmbedBuilder } = require('discord.js');

module.exports = class Help extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'help',
            description: 'Display the help menu',
            description_localizations: {
                "fr": "Afficher le menu d'aide",
            },
            category: SlashCommand.Categories.Divers,
            user_permissions: ['ManageMessages'],
            bot_permissions: ['EmbedLinks']
        });
    }

    async run (ctx) {
        const lang = ctx.inter.locale

        const applicationCommands = await ctx.client.application.commands.fetch();
        const slashCommands = ctx.client.slashCommandsHandler.slashCommands;

        slashCommands.forEach((cmd) => {
            cmd.description = lang === "fr" ? cmd.description_localizations[lang] : cmd.description;
        })

        const divers_cmd = slashCommands.filter(x => x.category.id === SlashCommand.Categories.Divers.id).map((x) => `${applicationCommands.find((cmd) => cmd.name === x.name) ? `</${applicationCommands.find((cmd) => cmd.name === x.name).name}:${applicationCommands.find((cmd) => cmd.name === x.name).id}>` : `${x.name}`} : ${x.description}`).join('\n');
        const server_cmd = slashCommands.filter(x => x.category.id === SlashCommand.Categories.ServerPterodactyl.id).map((x) => `${applicationCommands.find((cmd) => cmd.name === x.name) ? `</${applicationCommands.find((cmd) => cmd.name === x.name).name}:${applicationCommands.find((cmd) => cmd.name === x.name).id}>` : `${x.name}`} : ${x.description}`).join('\n');
        const userPterodactyl_cmd = slashCommands.filter(x => x.category.id === SlashCommand.Categories.UserPterodactyl.id).map((x) => `${applicationCommands.find((cmd) => cmd.name === x.name) ? `</${applicationCommands.find((cmd) => cmd.name === x.name).name}:${applicationCommands.find((cmd) => cmd.name === x.name).id}>` : `${x.name}`} : ${x.description}`).join('\n');
        const admin_cmd = slashCommands.filter(x => x.category.id === SlashCommand.Categories.Admin.id).map((x) => `${applicationCommands.find((cmd) => cmd.name === x.name) ? `</${applicationCommands.find((cmd) => cmd.name === x.name).name}:${applicationCommands.find((cmd) => cmd.name === x.name).id}>` : `${x.name}`} : ${x.description}`).join('\n');

        const embed = new EmbedBuilder()
            .setTitle("Les commandes")
            .setColor(ctx.me.displayHexColor)
            .setThumbnail(ctx.client.user.displayAvatarURL())
            .setFooter({text: `${ctx.user.displayName}`, iconURL: `${ctx.user.displayAvatarURL() || ctx.client.user.displayAvatarURL()}`})
            .addFields([
                { name: "🔒 __Admin__ : ", value: admin_cmd || "Aucune commande", inline: false},
                { name: "📡 __Pterodactyl serveur__ : ", value: server_cmd || "Aucune commande", inline: false},
                { name: "👤 __Pterodactyl utilisateur__ : ", value: userPterodactyl_cmd || "Aucune commande", inline: false},
                { name: "ℹ️ __Divers__ : ", value: divers_cmd || "Aucune commande", inline: false},
            ])

        ctx.send({ embeds: [embed] });
    }
}