const PreferredWorkType = require('../models/preferred_work_type');
class PreferredWorkTypeSeeder {
    constructor() {
        this.preferredWorkType = new PreferredWorkType();
    }
    async run() {
        await this.preferredWorkType.checkAndCreateTable();
        await this.preferredWorkType.truncateTable();
        await this.preferredWorkType.seedPreferredWorkTypeData(this.seedPreferredWorkTypeData());
        console.log('✅ Certification seeding completed.');
    }

    seedPreferredWorkTypeData() {
        return [
            {
                id: 1,
                name: 'Internship',
            },
            {
                id: 2,
                name: 'Full-Time',
            },
            {
                id: 3,
                name: 'Remote',
            },
            {
                id: 4,
                name: 'Hybrid',
            },
            {
                id: 5,
                name: 'On-Site',
            }
        ];
    }
}

module.exports = PreferredWorkTypeSeeder;