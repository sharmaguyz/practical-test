const fs = require('fs');
const path = require('path');

const tables = {};
const tableFiles = fs.readdirSync(__dirname).filter(file => file !== 'index.js');

tableFiles.forEach(file => {
    const tableName = path.basename(file, '.js');
    tables[tableName] = require(`./${file}`);
});

tables.validate = () => {
    const missingTables = Object.entries(tables)
        .filter(([key, config]) => key !== 'validate' && !config.tableName)
        .map(([key]) => key);

    if (missingTables.length > 0) {
        throw new Error(`Missing table configuration for: ${missingTables.join(', ')}`);
    }
};

module.exports = tables;