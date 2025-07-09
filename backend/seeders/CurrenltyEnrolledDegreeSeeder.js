const CurrenltyEnrolledDegree = require('../models/currently_enrolled_degree');
class CurrentlyEnrolledDegreeSeeder {
    constructor() {
        this.currenltyEnrolledDegree = new CurrenltyEnrolledDegree();
    }

    async run() {
        await this.currenltyEnrolledDegree.checkAndCreateTable();
        await this.currenltyEnrolledDegree.truncateTable();
        await this.currenltyEnrolledDegree.seedDegrees(this.seedCurrentlyEnrolledDegrees());
        console.log('✅ Currently Enrolled Degrees seeding completed.');
    }

    seedCurrentlyEnrolledDegrees() {
        return [
            {
                id: 1,
                name: 'Bachelor’s',
            },
            {
                id: 2,
                name: 'Master’s',
            },
            {
                id: 3,
                name: 'PHD',
            },
            {
                id: 4,
                name: 'Bootcamp',
            },
            {
                id: 5,
                name: 'Other',
            },
            {
                id: 6,
                name: 'Not Enrolled',
            }
        ];
    }
}

module.exports = CurrentlyEnrolledDegreeSeeder;