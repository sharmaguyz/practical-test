const TechnicalSkill = require('../models/technical_skill');
class TechnicalSkillSeeder {
    constructor() {
        this.technicalSkill = new TechnicalSkill();
    }
    async run() {
        await this.technicalSkill.checkAndCreateTable();
        await this.technicalSkill.truncateTable();
        await this.technicalSkill.seedTechnicalSkillsData(this.seedTechnicalSkillsData());
        console.log('✅Technical Skills Data seeding completed.');
    }

    seedTechnicalSkillsData() {
        return [
            {
                id: 1,
                name: 'Linux',
            },
            {
                id: 2,
                name: 'Windows Security',
            },
            {
                id: 3,
                name: 'Python',
            },
            {
                id: 4,
                name: 'Penetration Testing',
            },
            {
                id: 5,
                name: 'Networking',
            },
            {
                id: 6,
                name: 'Cloud Security',
            },
            {
                id: 7,
                name: 'Digital Forensics',
            },
            {
                id: 8,
                name: 'Incident-Response',
            },
            {
                id: 9,
                name: 'SIEM Tools (Splunk, ELK, etc.)',
            },
            {
                id: 10,
                name: 'Other',
            },
        ];
    }
}

module.exports = TechnicalSkillSeeder;