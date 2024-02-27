const CommandContext = require('../../managers/CommandContext');
const { PermissionsBitField } = require('discord.js');

module.exports = class SlashCommandsService {
    constructor(event) {
        this.client = event.client
        this.slashLogger = event.slashLogger
        this.database = event.database
        this.config = event.config
        this.messageFormatter = event.messageFormatter
    }

    async handle (inter) {
        // Check if the interaction is a command
        if (!inter.isChatInputCommand()) return

        // Check if the interaction is in DM
        if (inter.channel.type === 1) return inter.reply({content: this.messageFormatter.error('Non disponible en message privé !'), ephemeral: true});

        // Check if the bot can see & write in the channel
        if (!inter.channel.permissionsFor(this.client.user.id)?.has(PermissionsBitField.Flags.ViewChannel))
            return inter.reply({content: this.messageFormatter.error('J\'ai besoin des permissions \`ViewChannel\` !'), ephemeral: true});

        if (!inter.channel.permissionsFor(this.client.user.id)?.has(PermissionsBitField.Flags.SendMessages))
            return inter.reply({content: this.messageFormatter.error('J\'ai besoin des permissions \`SendMessages\` !'), ephemeral: true});

        if (!inter.channel.permissionsFor(this.client.user.id)?.has(PermissionsBitField.Flags.SendMessagesInThreads))
            return inter.reply({content: this.messageFormatter.error('J\'ai besoin des permissions \`SendMessagesInThreads\` !'), ephemeral: true});

        // Get the command
        const slashCmd = this.client.slashCommandsHandler.getSlashCommand(inter.commandName);
        if (!slashCmd) return inter.reply({content: this.messageFormatter.error('Cette commande n\'existe pas !'), ephemeral: true});

        // Retrieving bot member information
        const me = await inter.guild.members.fetch(this.client.user.id);

        // Check if the bot has the right permissions
        if (slashCmd.bot_permissions.length > 0 && !slashCmd.bot_permissions.every((p) => me.permissions.has(p))) {
            return inter.reply({content: `${this.client.emojiError} J'ai besoin des permissions ${'`' + slashCmd.bot_permissions.join("`, `") + '`'} !`});
        }

        // Create the command context
        const ctx = new CommandContext(this.client, slashCmd, inter);

        slashCmd.run(ctx).catch((err) => {
            console.log(err);
            inter.reply({content: this.messageFormatter.error('Une erreur est survenue, les développeurs ont été avertis !'), ephemeral: true}).catch(() => null);
        });

        this.slashLogger.slashCommand(inter);
    }
}
