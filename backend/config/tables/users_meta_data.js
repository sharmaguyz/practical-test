module.exports = {
    tableName: `${process.env.DYNAMODB_TABLE_PREFIX}users_meta_data`,
    schema: {
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
        ],
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'MetaDataIndex',
                KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' }
            },
        ],
        BillingMode: 'PAY_PER_REQUEST' // Better for scaling than provisioned
    },
    expectedAttributes: {
        country: { type: "S", description: "User selected country" },
        state : { type: "S", description: "User selected state" },
        city : { type: "S", description: "User added city" },
        linkedin : { type: "S", description: "User added linkedin" },
        portfolio : { type: "S", description: "User added portfolio" },
        highestDegree : { type: "S", description: "User selected highestDegree" },
        currentlyEnrolled : { type: "S", description: "User selected currentlyEnrolled" },
        university : { type: "S", description: "User added university" },
        graduationDate : { type: "S", description: "User added graduationDate" },
        yearsOfExperience : { type: "S", description: "User selected yearsOfExperience" },
        certifications : { type: "L", description: "User selected certifications" },
        otherCertification : { type: "S", description: "User added otherCertification" },
        securityClearance : { type: "S", description: "User selected securityClearance" },
        workAuthorization : { type: "S", description: "User selected workAuthorization" },
        workType : { type: "L", description: "User selected workType" },
        activelySeeking : { type: "S", description: "User selected activelySeeking" },
        profileVisible : { type: "S", description: "User selected profileVisible" },
        technicalSkills : { type: "L", description: "User selected technicalSkills" },
        createdAt: { type : "S", description : "User MetaData created at"},
        updatedtAt: { type : "S", description : "User MetaData updated at"},
    },
    indexes: {
        byUserID: {
            type: 'gsi',
            indexName: 'MetaDataIndex'
        }
    },
    BillingMode: 'PAY_PER_REQUEST'
};