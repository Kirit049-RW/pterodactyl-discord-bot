module.exports = class Knex {
    constructor(client) {
        this.client = client;
        this.config = client.config;
    }

    table (tableName) {
        return this.knex(tableName);
    }

    async loadDatabase() {
        this.knex = require('knex')(this.config['database']);

        this.knex.raw("SELECT VERSION()").then(
            (version) => console.log((version[0][0]))
        ).catch((err) => { console.log( err); throw err })
            .finally(() => {});

        this.client.once('ready', async () => {await this.checkAndUpdate();});
    }

    async checkAndUpdate () {
        // Link Discord user to Pterodactyl user
        const hasTableUsers = await this.knex.schema.hasTable("users");
        if (!hasTableUsers) await this.knex.schema.createTable('users', function(t) {
            t.increments('id').notNullable().primary();
            t.string('discordId', 20);
            t.integer('pterodactylId', 20);
        });

        // Bot to monit
        const hasTableMonitoring = await this.knex.schema.hasTable("monitoring");
        if (!hasTableMonitoring) await this.knex.schema.createTable('monitoring', function(t) {
            t.increments('id').notNullable().primary();
            t.string('botId', 20);
            t.bigInteger('createdAt');
        });

        // Schedule to suspend server
        const hasTableSuspend = await this.knex.schema.hasTable("schedule_servers");
        if (!hasTableSuspend) await this.knex.schema.createTable('schedule_servers', function(t) {
            t.increments('id').notNullable().primary();
            t.integer('serverId', 20);
            t.bigInteger('time');
        });
    }
}
