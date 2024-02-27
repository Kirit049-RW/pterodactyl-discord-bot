const SlashCommand = require('../../managers/structures/SlashCommands.js');
const { EmbedBuilder } = require('discord.js');

module.exports = class HelpSFTP extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'help-sftp',
            description: 'Get help to config the SFTP',
            description_localizations: {
                "fr": "Obtenir de l'aide pour configurer le SFTP"
            },
            category: SlashCommand.Categories.Divers,
            hiddenInHelp: true,
            bot_permissions: ['EmbedLinks']
        });
    }

    async run (ctx) {
        const embed = new EmbedBuilder()
            .setAuthor({name: "Connexion SFTP à votre serveur", iconURL: ctx.me.displayAvatarURL()})
            .setDescription(`**➡️ • Téléchargement de FileZilla :**\n> [Lien de téléchargement](https://download.filezilla-project.org/client/FileZilla_3.64.0_win64_sponsored2-setup.exe)\n> [Site officiel](https://filezilla-project.org/)\n> [Tutoriel](https://www.youtube.com/watch?v=EpQw9V3jXrM)`+
            `\n\n**👤 • Informations de connexion :**\n> **Hôte :** [${ctx.config["pterodactyl"]["host"]}](https://google.com)\n> **Port :** \`${ctx.config["pterodactyl"]["port"]}\`\n> **Nom d'utilisateur : **Votre serveur → Settings → SFTP Details → Username\n> **Mot de passe :** Même mot de passe que votre compte Pterodactyl`)
            .setColor(ctx.me.displayHexColor)
            .setFooter({text: `Demandé par ${ctx.user.displayName}`, iconURL: ctx.user.displayAvatarURL() || ctx.me.displayAvatarURL()})

        ctx.send({embeds: [embed]});
    }
}
