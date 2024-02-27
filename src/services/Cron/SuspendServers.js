const schedule = require('node-schedule');

module.exports = class SuspendServers {
    constructor(event) {
        this.client = event.client
        this.config = event.config
        this.logger = event.logger
        this.database = event.database
        this.utils = event.utils
        this.pterodactyl = event.client.pterodactyl
    }

    async handle() {
        await this.utils.sleep(5 * 1000);
        const data = await this.database.table('schedule_servers').select();

        for (let i = 0; i < data.length; i++) {
            const timing = data[i].time;

            if (timing > Date.now()) {
                /* Get the server */
                const server = await this.pterodactyl.app.getServerInfo(data[i].serverId).catch(() => null);
                if (!server) {
                    await this.database.table('schedule_servers').delete().where('serverId', data[i].serverId);
                    continue;
                }

                schedule.scheduleJob(`${server.id}`, timing, async () => {
                    /* Suspend the server */
                    this.pterodactyl.app.suspendServer(server.id)
                        .then(async () => {
                            this.logger.warn(`Schedule Suspend Server : ${server.name} (${server.id})`);

                            /* Delete from database */
                            await this.database.table('schedule_servers').delete().where('serverId', server.id);
                        })
                        .catch((e) => {
                            this.client.logger.error(`Schedule Create Server Error : ${e}`);
                        });
                });
            }
            else {
                await this.database.table('schedule_servers').delete().where({time: data[i].time});
            }
        }
    }
}