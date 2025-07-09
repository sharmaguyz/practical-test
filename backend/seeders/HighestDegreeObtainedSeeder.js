const HighestDegreeObtained = require('../models/highest_degree_obtained');
class HighestDegreeObtainedSeeder {
    constructor() {
        this.highestDegreeObtained = new HighestDegreeObtained();
    }
    async run() {
        await this.highestDegreeObtained.checkAndCreateTable();
        await this.highestDegreeObtained.truncateTable();
        await this.highestDegreeObtained.seedHighestDegreeData(this.seedHighestDegreeObtained());
        console.log('✅ Highest Degree Obtained seeding completed.');
    }

    seedHighestDegreeObtained() {
        return [
            {
                id: 1,
                name: 'None',
            },
            {
                id: 2,
                name: 'High School',
            },
            {
                id: 3,
                name: 'Associate',
            },
            {
                id: 4,
                name: 'Bachelor’s',
            },
            {
                id: 5,
                name: 'Master’s',
            },
            {
                id: 6,
                name: 'PHD',
            },
            {
                id: 7,
                name: 'Other',
            },
        ];
    }
}

module.exports = HighestDegreeObtainedSeeder;