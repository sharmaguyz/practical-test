require('dotenv').config();

// seed.js

const CurrentlyEnrolledDegreeSeeder = require('./CurrenltyEnrolledDegreeSeeder');
const HighestDegreeObtainedSeeder  = require('./HighestDegreeObtainedSeeder')
const CertificationSeeder = require('./CertificationSeeder');
const SecurityClearanceLevelSeeder = require('./SecurityClearanceLevelSeeder');
const WorkAauthorizationSeeder = require('./WorkAauthorizationSeeder');
const PreferredWorkTypeSeeder = require('./PreferredWorkTypeSeeder');
const TechnicalSkillSeeder = require('./TechnicalSkillSeeder');
const runSeeders = async () => {
  console.log('Starting seed process...');
  const seeders = [
    new CurrentlyEnrolledDegreeSeeder(),
    new HighestDegreeObtainedSeeder(),
    new CertificationSeeder(),
    new SecurityClearanceLevelSeeder(),
    new WorkAauthorizationSeeder(),
    new PreferredWorkTypeSeeder(),
    new TechnicalSkillSeeder()
  ];

  for (const seeder of seeders) {
    await seeder.run();
  }
  console.log('🌱 All seeders executed successfully.');
};

runSeeders().catch(err => {
  console.error('❌ Error running seeders:', err);
  process.exit(1);
});
