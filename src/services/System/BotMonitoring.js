module.exports = class BotMonitoring {
    constructor(event) {
        this.client = event.client
        this.database = event.database
        this.config = event.config
        this.cooldown = new Map();
    }

    async handle (oldPresence, newPresence) {
        const { member, status } = newPresence;

        /* Check if the member is a bot */
        if (!member.user.bot) return

        /* Check if the bot is in the database */
        const botToWatch = await this.database.table('monitoring').select().where({ botId: member.id });
        if (!botToWatch[0]) return

        /* Get the cooldown */
        const cooldown = this.cooldown.get(member.id);

        /* Check if the bot is offline */
        if (status === "offline") {
            /* Check if the bot is in the cooldown */
            if (cooldown && cooldown === "offline") return

            /* Add the bot to the cooldown */
            this.cooldown.set(member.id, "offline");

            /* Prevent the bot */
            const channel = this.client.channels.cache.get(this.config["monitoringBot"]["channelId"]);
            if (!channel) return

            channel.send({
                content: `<@&${this.config["monitoringBot"]["roleId"]}>`,
                embeds: [{
                    title: `${member.user.displayName} - OFFLINE`,
                    description: `✅ ${member.user} (\`${member.id}\`) est **HORS LIGNE**`,
                    color: 0xFF0000
                }]
            }).catch(() => null);
        }
        else if (status === 'online') {
            /* Return if there is no cooldown, so no down */
            if (!cooldown) return

            /* Check if the bot is in the cooldown */
            if (cooldown === "online") return

            /* Add the bot to the cooldown */
            this.cooldown.set(member.id, "online");

            /* Prevent the bot */
            const channel = this.client.channels.cache.get(this.config["monitoringBot"]["channelId"]);
            if (!channel) return

            channel.send({
                content: `<@&${this.config["monitoringBot"]["roleId"]}>`,
                embeds: [{
                    title: `${member.user.displayName} - ONLINE`,
                    description: `✅ ${member.user} (\`${member.id}\`) est **EN LIGNE**`,
                    color: 0x00FF00
                }]
            }).catch(() => null);
        }
    }
}