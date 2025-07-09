const Certification = require('../models/certification');
class CertificationSeeder {
    constructor() {
        this.certification = new Certification();
    }
    async run() {
        await this.certification.checkAndCreateTable();
        await this.certification.truncateTable();
        await this.certification.seedCertificationData(this.seedCertificationData());
        console.log('✅ Certification seeding completed.');
    }

    seedCertificationData() {
        return [
            {
                id: 1,
                name: 'Security+',
            },
            {
                id: 2,
                name: 'Network+',
            },
            {
                id: 3,
                name: 'CISSP',
            },
            {
                id: 4,
                name: 'CISM',
            },
            {
                id: 5,
                name: 'CISA',
            },
            {
                id: 6,
                name: 'AWS Cloud Practitioner',
            },
            {
                id: 7,
                name: 'CEH',
            },
            {
                id: 8,
                name: 'OSCP',
            },
            {
                id: 9,
                name: 'Other',
            },
        ];
    }
}

module.exports = CertificationSeeder;