const dynamoDBService = require('../services/dynamodb');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('bson');
const UserRoles = require('../models/user_roles');
const UserMetaData = require('./users_meta_data');
const InstructorMetaData = require('./instructor_meta_data');
const CourseModel = require('../models/course');
const USER_ROLES = require('../config/enums/role');
const { purchasedAt } = require('../config/helpers/common');
class User{
    constructor(){
        this.tableName = dynamoDBService.tables.users.tableName;
        this.tableSchema = dynamoDBService.tables.users.schema;
        this.checkAndCreateTable();
    }
    async checkAndCreateTable() {
        try {
            // Check if the table exists
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('users', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
            } else {
                console.error("❌ Error checking/creating table:", error);
            }
        }
    }
    static async findById(id) {
        const params = {
            TableName: dynamoDBService.tables.users.tableName,
            Key: {
                id: id
            }
        };
        try {
            const result = await dynamoDBService.docClient.get(params).promise();
            return result.Item;
        } catch (error) {
            throw error;
        }
    }
    static async findByIds(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return [];
        const uniqueIds = [...new Set(ids)];
        const CHUNK_SIZE = 100;
        const chunks = [];
        for (let i = 0; i < uniqueIds.length; i += CHUNK_SIZE) {
            chunks.push(uniqueIds.slice(i, i + CHUNK_SIZE));
        }
        const results = [];
        for (const chunk of chunks) {
            const params = {
                RequestItems: {
                    [dynamoDBService.tables.users.tableName]: {
                        Keys: chunk.map(id => ({ id }))
                    }
                }
            };
            try {
                const response = await dynamoDBService.docClient.batchGet(params).promise();
                const users = response.Responses[dynamoDBService.tables.users.tableName] || [];
                results.push(...users);
            } catch (error) {
                console.error("DynamoDB batchGet error:", error);
            }
        }
        return results;
    }

    static async findByToken(token) {
        const params = {
            TableName:dynamoDBService.tables.users.tableName,
            FilterExpression: "resetPasswordToken = :token",
            ExpressionAttributeValues: { ":token": token },
        };

        const result = await dynamoDBService.docClient.scan(params).promise();
        // console.log("inresult===>",result);
        return result.Items[0];
    }
    static async updateResetToken(userId, token) {
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        const params = {
            TableName: dynamoDBService.tables.users.tableName,
            Key: {
                id: userId
            },
            UpdateExpression: 'SET resetPasswordToken = :token, resetPasswordExpires = :expires',
            ExpressionAttributeValues: {
                ':token': token,
                ':expires': expires.toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };
        const result = await dynamoDBService.docClient.update(params).promise();
        return result.Attributes;
    }
    
    static async updatePassword(userId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const params = {
            TableName: dynamoDBService.tables.users.tableName,
            Key: {
                id: userId
            },
            UpdateExpression: 'SET password = :password, resetPasswordToken = :token, resetPasswordExpires = :expires',
            ExpressionAttributeValues: {
                ':password': hashedPassword,
                ':token': null,
                ':expires': null
            },
            ReturnValues: 'ALL_NEW'
        };
        const result = await dynamoDBService.docClient.update(params).promise();
        return result.Attributes;
    }
    static async findByEmail(email){
        const params = {
            TableName: dynamoDBService.tables.users.tableName,
            IndexName: dynamoDBService.tables.users.indexes.byEmail.indexName,
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            },
            Limit: 1
        };
        const result = await dynamoDBService.docClient.query(params).promise();
        return result.Items[0];
    }
    static async create(userData){
        const { email,password,fullName,phoneNumber,country,state,city,linkedin,portfolio,highestDegree,currentlyEnrolled,university,graduationDate,yearsOfExperience,certifications,otherCertification,securityClearance,workAuthorization,workType,activelySeeking,profileVisible,technicalSkills,role,cognitoSub,cognitoUserName,createdBy } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = new ObjectId().toString();
        const userItem = {
            id: id,
            email: email,
            password: hashedPassword,
            fullName: fullName,
            phoneNumber:phoneNumber,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: role,
            isApproved:'pending',
            cognitoSub:cognitoSub,
            cognitoUserName:cognitoUserName,
            awsApproved:'pending',
            createdBy:createdBy
        };
        const userMetaData = {
            id:new ObjectId().toString(),
            userId:userItem.id,
            country:country,
            state:state,
            city:city,
            linkedin:linkedin,
            portfolio:portfolio,
            highestDegree:highestDegree,
            currentlyEnrolled:currentlyEnrolled,
            university:university,
            graduationDate:graduationDate.toISOString(),
            yearsOfExperience:yearsOfExperience,
            certifications:certifications, //array
            otherCertification:otherCertification,
            securityClearance:securityClearance,
            workAuthorization:workAuthorization,
            workType:workType, // array
            activelySeeking:activelySeeking,
            profileVisible:profileVisible,
            technicalSkills:technicalSkills, // array 
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: dynamoDBService.tables.users.tableName}).promise();
            await dynamoDBService.putItem('users', userItem, 'attribute_not_exists(id)');
            await dynamoDBService.dynamoDB.describeTable({ TableName: dynamoDBService.tables.users_meta_data.tableName}).promise();
            await dynamoDBService.putItem('users_meta_data', userMetaData, 'attribute_not_exists(id)');
            return { user: userItem, metadata: userMetaData };
        } catch (error) {
            console.error('Error creating user --- :', error);
            if (error.code === 'ConditionalCheckFailedException') {
                throw new Error('User with this email already exists');
            }
            throw error;
        }
    }
    static async fetchAllUsersByRole({ role, status, limit = 10, page = 1, searchText = '' }) {
        try {
            if (!role) throw new Error('Role parameter is required');
            role = await UserRoles.getRoleId(role);
            role = role.roleId;
            const offset = (page - 1) * limit;
            let params = {
                TableName: dynamoDBService.tables.users.tableName,
                FilterExpression: '(attribute_exists(#role) AND #role = :role)',
                ExpressionAttributeNames: { '#role': 'role' },
                ExpressionAttributeValues: { ':role': role },
                Limit: limit
            };
            if (status) {
                params.FilterExpression += ' AND (attribute_exists(#isApproved) AND #isApproved = :status)';
                params.ExpressionAttributeNames['#isApproved'] = 'isApproved';
                params.ExpressionAttributeValues[':status'] = status;
            }
            if (searchText && searchText.trim() !== '') {
                params.FilterExpression += ' AND (contains(#fullName, :searchText) OR contains(#email, :searchText) OR contains(#phoneNumber, :searchText))';
                params.ExpressionAttributeNames['#fullName'] = 'fullName';
                params.ExpressionAttributeNames['#email'] = 'email';
                params.ExpressionAttributeNames['#phoneNumber'] = 'phoneNumber';
                params.ExpressionAttributeValues[':searchText'] = searchText;
            }
            let scannedItems = [];
            let lastEvaluatedKey = null;
            do {
                const currentParams = { ...params, ExclusiveStartKey: lastEvaluatedKey };
                const data = await dynamoDBService.docClient.scan(currentParams).promise();
                scannedItems.push(...(data.Items || []));
                lastEvaluatedKey = data.LastEvaluatedKey;
                if (scannedItems.length >= offset + limit + 1 || !lastEvaluatedKey) break;
            } while (true);
            const hasMore = scannedItems.length > offset + limit;
            const paginatedItems = scannedItems.slice(offset, offset + limit);
            let totalCount = 0;
            lastEvaluatedKey = null;
            do {
                const countParams = {
                    ...params,
                    ExclusiveStartKey: lastEvaluatedKey,
                    ProjectionExpression: '#role',
                    ExpressionAttributeNames: {
                        ...params.ExpressionAttributeNames,
                        '#role': 'role'
                    }
                };
                const countData = await dynamoDBService.docClient.scan(countParams).promise();
                totalCount += countData.Items?.length || 0;
                lastEvaluatedKey = countData.LastEvaluatedKey;
            } while (lastEvaluatedKey);
            const totalPages = Math.ceil(totalCount / 10);
            return {
                users: paginatedItems,
                pagination: {
                    totalFetched: paginatedItems.length,
                    currentPage: page,
                    limit,
                    hasMore,
                    totalPages,
                    totalCount
                }
            };
        } catch (err) {
            console.error("Error in fetchAllUsersByRole:", err.message);
            throw err;
        }
    }
    static async delete(id,roleName) {
        try {
            const params = {
                TableName: dynamoDBService.tables.users.tableName,
                Key: {
                    id: id
                },
            };
            const result = await dynamoDBService.docClient.delete(params).promise();
            if(roleName === USER_ROLES.STUDENT){
               await UserMetaData.delete(id);
            }else if(roleName === USER_ROLES.INSTRUCTOR){
                await InstructorMetaData.delete(id);
                const result = await CourseModel.findByInstructorId(id);
                if (result?.items?.length > 0) await CourseModel.deleteByInstructorId(id);
            }
            return result;
        } catch (error) {
            console.error("Error deleting user:", error);
            throw new Error("Could not delete the user.");
        }
    }
    static async updateStatus(userId,status) {
        try {
            const params = {
                TableName: dynamoDBService.tables.users.tableName,
                Key: {
                    id: userId
                },
                UpdateExpression: 'SET isApproved = :isApproved',
                ExpressionAttributeValues: {
                    ':isApproved': status
                },
                ReturnValues: 'ALL_NEW'
            };
            const result = await dynamoDBService.docClient.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error("Error updating status:", error);
            throw new Error("Could not update the user status.");
        }
        
    }
    static async updateUser(userId,rolename,body) {
        try {
            const { email,fullName,phoneNumber} = body;
            const updatedAt = new Date().toISOString();
            const params = {
                TableName: dynamoDBService.tables.users.tableName,
                Key: {
                    id: userId
                },
                UpdateExpression: 'SET email = :email, fullName = :fullName, phoneNumber = :phoneNumber, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':email': email,
                    ':fullName': fullName,
                    ':phoneNumber': phoneNumber,
                    ':updatedAt' : updatedAt
                },
                ReturnValues: 'ALL_NEW'
            };
            const result = await dynamoDBService.docClient.update(params).promise();
            if(result){
                if(rolename === USER_ROLES.STUDENT){
                    await UserMetaData.update(userId,body);
                }else if(rolename === USER_ROLES.INSTRUCTOR){
                    await InstructorMetaData.update(userId,body);
                }
            }
            return result.Attributes;
        } catch (error) {
            console.error("Error updating user:", error);
            throw new Error("Could not update the user data.");
        }
    }
    static async cognitoAccountVerified(userId) {
        try {
            const updatedAt = new Date().toISOString();
            const params = {
                TableName: dynamoDBService.tables.users.tableName,
                Key: {
                    id: userId
                },
                UpdateExpression: 'SET awsApproved = :awsApproved, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':awsApproved': 'completed',
                    ':updatedAt' : updatedAt
                },
                ReturnValues: 'ALL_NEW'
            };
            const result = await dynamoDBService.docClient.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error("Error updating user:", error);
            throw new Error("Could not update the user data.");
        }
    }
    static async courseList(limit = 16, page = 1, searchText = '', sortBy = 'createdAt', sortOrder = 'default'){
        try {
            const offset = (page - 1) * limit;
            const isAscending = sortOrder.toLowerCase() === 'asc';
            let params = {
                TableName: dynamoDBService.tables.courses.tableName,
                FilterExpression: '#isApproved = :approved AND #published = :published AND #status = :status',
                ExpressionAttributeNames: {
                    '#isApproved': 'isApproved',
                    '#published': 'published',
                    '#status' : 'status'
                },
                ExpressionAttributeValues: {
                    ':approved': 'completed',
                    ':published': 'completed',
                    ':status' : 'active'
                },
                Limit: limit,
                ExclusiveStartKey: null
            };
            // if (searchText) {
            //     const keywords = searchText.toLowerCase()
            //         .trim()
            //         .split(/\s+/)
            //         .filter(Boolean);
            //     const keywordExpressions = [];
            //     keywords.forEach((word, index) => {
            //         const nameAttr = `#courseNameLower${index}`;
            //         const descAttr = `#description${index}`;
            //         const valuePlaceholder = `:searchText${index}`;
            //         params.ExpressionAttributeNames[nameAttr] = 'courseNameLower';
            //         params.ExpressionAttributeNames[descAttr] = 'description';
            //         params.ExpressionAttributeValues[valuePlaceholder] = word;
            //         keywordExpressions.push(`contains(${nameAttr}, ${valuePlaceholder}) OR contains(${descAttr}, ${valuePlaceholder})`);
            //     });
            //     if (keywordExpressions.length > 0) {
            //         const keywordFilter = keywordExpressions.join(' OR ');
            //         params.FilterExpression += ` AND (${keywordFilter})`;
            //     }
            // }
            if (searchText) {
                const fullText = searchText.toLowerCase().trim();

                params.ExpressionAttributeNames['#courseNameLower'] = 'courseNameLower';
                params.ExpressionAttributeValues[':searchText'] = fullText;

                params.FilterExpression += ` AND contains(#courseNameLower, :searchText)`;
            }
            let allItems = [];
            let totalCount = 0;

            let scannedCount = 0;
            do {
                const data = await dynamoDBService.docClient.scan(params).promise();
                allItems = [...allItems, ...(data.Items || [])];
                scannedCount += data.ScannedCount || 0;
                params.ExclusiveStartKey = data.LastEvaluatedKey;

                if (!data.LastEvaluatedKey) break;
            } while (params.ExclusiveStartKey);
                allItems.sort((a, b) => {
                    const valA = a[sortBy];
                    const valB = b[sortBy];
                    if (valA == null && valB == null) return 0;
                    if (valA == null) return isAscending ? 1 : -1;
                    if (valB == null) return isAscending ? -1 : 1;
                    if (valA instanceof Date || valB instanceof Date) {
                        return isAscending
                            ? new Date(valA).getTime() - new Date(valB).getTime()
                            : new Date(valB).getTime() - new Date(valA).getTime();
                    }
                    if (typeof valA === 'string' && typeof valB === 'string') {
                        return isAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
                    }
                    return isAscending ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
                });
            const paginatedItems = allItems.slice(offset, offset + limit);
            for (let course of paginatedItems) {
                const [instructor, instructorMetaData] = await Promise.all([
                    dynamoDBService.docClient.get({
                    TableName: dynamoDBService.tables.users.tableName,
                    Key: { id: course.instructorId },
                    ProjectionExpression: '#fullName',
                    ExpressionAttributeNames: { '#fullName': 'fullName' }
                    }).promise().then(res => res.Item || null),
                    dynamoDBService.docClient.query({
                    TableName: dynamoDBService.tables.instructors_meta_data.tableName,
                    IndexName: 'MetaDataIndex',
                    KeyConditionExpression: 'userId = :uid',
                    ExpressionAttributeValues: { ':uid': course.instructorId },
                    ProjectionExpression: '#org, #pic',
                    ExpressionAttributeNames: {
                        '#org': 'organization',
                        '#pic': 'profilePic'
                    }
                    }).promise().then(res => res.Items?.[0] || null)
                ]);
                course.instructor = instructor;
                course.instructorMetaData = instructorMetaData;
            }
            totalCount = allItems.length;
            const totalPages = Math.ceil(totalCount / limit);
             return {
                success: true,
                courses: paginatedItems,
                code: 200,
                pagination: {
                    totalFetched: paginatedItems.length,
                    currentPage: parseInt(page.toString()),
                    limit,
                    hasMore: offset + limit < totalCount,
                    totalPages,
                    totalCount
                }
            };
        } catch (error) {
            console.error('UserModel.courseList Error:', error);
            return {
                success: false,
                code: 500,
                message: error.message
            };
        }
    }
    static async myPurchasedCourses(userId) {
        try {
            const orderResult = await dynamoDBService.docClient.query({
                TableName: dynamoDBService.tables.orders.tableName,
                IndexName: 'UserIndex',
                KeyConditionExpression: 'userId = :uid',
                FilterExpression: 'paymentStatus = :status',
                ExpressionAttributeValues: {
                    ':uid': userId,
                    ':status': 'paid',
                },
                ProjectionExpression: 'id, createdAt',
            }).promise();

            if (!orderResult.Items || orderResult.Items.length === 0) return [];

            const courseMetaMap = {}; // { [courseId]: { createdAt, orderId } }
            const orderIds = [];

            orderResult.Items.forEach(order => {
                orderIds.push(order.id);
            });

            for (const orderId of orderIds) {
                const itemResult = await dynamoDBService.docClient.query({
                    TableName: dynamoDBService.tables.order_items.tableName,
                    IndexName: 'OrderIndex',
                    KeyConditionExpression: 'orderId = :oid',
                    ExpressionAttributeValues: {
                        ':oid': orderId,
                    },
                    ProjectionExpression: 'courseId',
                }).promise();

                itemResult.Items.forEach(item => {
                    courseMetaMap[item.courseId] = {
                        orderId,
                        createdAt: orderResult.Items.find(o => o.id === orderId)?.createdAt || null,
                    };
                });
            }

            const courseIds = Object.keys(courseMetaMap);
            if (courseIds.length === 0) return [];

            const results = [];

            while (courseIds.length > 0) {
                const batch = courseIds.splice(0, 100);
                const ATTRIBUTES = ['courseName', 'id', 'courseImage', 'courseDuration', 'description', 'price', 'instructorId','start_date','end_date'];

                const params = {
                    RequestItems: {
                        'app_courses': {
                            Keys: batch.map(id => ({ id })),
                            ProjectionExpression: ATTRIBUTES.join(', '),
                        }
                    }
                };

                const batchRes = await dynamoDBService.docClient.batchGet(params).promise();
                const items = batchRes.Responses['app_courses'] || [];

                const instructorIds = [...new Set(items.map(i => i.instructorId).filter(Boolean))];

                const instructorBatch = await dynamoDBService.docClient.batchGet({
                    RequestItems: {
                        [dynamoDBService.tables.users.tableName]: {
                            Keys: instructorIds.map(id => ({ id })),
                            ProjectionExpression: 'id, fullName'
                        }
                    }
                }).promise();

                const instructorMap = Object.fromEntries(
                    (instructorBatch.Responses?.[dynamoDBService.tables.users.tableName] || [])
                    .map(i => [i.id, i.fullName])
                );

                items.forEach(item => {
                    const meta = courseMetaMap[item.id];
                    results.push({
                        courseId: item.id,
                        courseName: item.courseName,
                        courseImage: item.courseImage,
                        courseDuration: item.courseDuration,
                        description: item.description,
                        price: Number(item.price),
                        purchasedAt: purchasedAt(meta.createdAt),
                        purchasedAtRaw: meta.createdAt,
                        orderId: meta.orderId,
                        instructorName: instructorMap[item.instructorId] || 'N/A',
                        startDate: item.start_date ? purchasedAt(item.start_date) : 'N/A',
                        endDate: item.end_date ? purchasedAt(item.end_date) : 'N/A'
                    });
                });
            }

            results.sort((a, b) => new Date(b.purchasedAtRaw) - new Date(a.purchasedAtRaw));
            results.forEach(item => delete item.purchasedAtRaw);

            return results;
        } catch (error) {
            console.error("Error fetching purchased courses:", error);
            return [];
        }
    }

    static async courseSuggestions(searchText) {
        if (!searchText || !searchText.trim()) return [];
        const keywords = searchText.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const params = {
            TableName: dynamoDBService.tables.courses.tableName,
            ProjectionExpression: '#courseName',
            FilterExpression: '#isApproved = :approved AND #published = :published AND #status = :status',
            ExpressionAttributeNames: {
            '#isApproved': 'isApproved',
            '#published': 'published',
            '#status': 'status',
            '#courseName': 'courseName',
            '#courseNameLower': 'courseNameLower'
            },
            ExpressionAttributeValues: {
            ':approved': 'completed',
            ':published': 'completed',
            ':status': 'active',
            },
            Limit: 50,
        };
        if (keywords.length) {
            const keywordConditions = keywords.map((kw, i) => {
            const key = `:kw${i}`;
            params.ExpressionAttributeValues[key] = kw;
            return `contains(#courseNameLower, ${key})`;
            });
            params.FilterExpression += ` AND (${keywordConditions.join(' OR ')})`;
        }
        try {
            const result = await dynamoDBService.docClient.scan(params).promise();
            return (result.Items || []).slice(0, 10);
        } catch (error) {
            console.error('courseSuggestions Error:', error);
            return [];
        }
    }

}

module.exports = User;