const WorkAauthorization = require('../models/work_authorization');
class WorkAauthorizationSeeder {
    constructor() {
        this.workAauthorization = new WorkAauthorization();
    }
    async run() {
        await this.workAauthorization.checkAndCreateTable();
        await this.workAauthorization.truncateTable();
        await this.workAauthorization.seedWorkAauthorizationData(this.seedWorkAauthorizationData());
        console.log('✅ Work authorization seeding completed.');
    }

    seedWorkAauthorizationData() {
        return [
            {
                id: 1,
                name: 'U.S. Citizen',
            },
            {
                id: 2,
                name: 'Green Card Holder',
            },
            {
                id: 3,
                name: 'Requires Visa Sponsorship',
            }
        ];
    }
}

module.exports = WorkAauthorizationSeeder;