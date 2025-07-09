const SecurityClearanceLevel = require('../models/security_clearance_level');
class SecurityClearanceLevelSeeder {
    constructor() {
        this.securityClearanceLevel = new SecurityClearanceLevel();
    }
    async run() {
        await this.securityClearanceLevel.checkAndCreateTable();
        await this.securityClearanceLevel.truncateTable();
        await this.securityClearanceLevel.seedSecurityClearanceLevelsData(this.seedSecurityClearanceLevelsData());
        console.log('✅ Security Clearance Level seeding completed.');
    }

    seedSecurityClearanceLevelsData() {
        return [
            {
                id: 1,
                name: 'No Clearance',
            },
            {
                id: 2,
                name: 'Public Trust',
            },
            {
                id: 3,
                name: 'Secret',
            },
            {
                id: 4,
                name: 'Top Secret',
            }
        ];
    }
}

module.exports = SecurityClearanceLevelSeeder;