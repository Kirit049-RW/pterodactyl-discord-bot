const Events = require('../../managers/structures/Events');

const CronSuspendServer = require('../../services/Cron/SuspendServers');

module.exports = class Ready extends Events {
    constructor (client) {
        super(client, 'ready')
        this.cronSuspendServer = new CronSuspendServer(this);
    }

    async handle () {
        this.logger.ready(this.client.user.displayName + ' est connecté !');
        await this.client.user.setStatus('online');
        await this.client.user.setActivity(`Pterodactyl`, { type: 3 });

        /* Cron suspend server */
        await this.cronSuspendServer.handle();
    }
}