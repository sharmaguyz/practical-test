const dynamoDBService = require('../services/dynamodb');
var moment = require('moment-timezone');

const { ObjectId } = require('bson');
const { purchasedAt } = require('.././config/helpers/common');

class Course {
    constructor() {
        this.tableName = dynamoDBService.tables.courses.tableName;
        this.tableSchema = dynamoDBService.tables.courses.schema;
        this.checkAndCreateTable();
    }
    async checkAndCreateTable() {
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('courses', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
            } else {
                console.error("❌ Error checking/creating table:", error);
            }
        }
    }
    static async findById(id) {
        const params = {
            TableName: dynamoDBService.tables.courses.tableName,
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
    static async findByInstructorId(instructorId) {
        const params = {
            TableName: dynamoDBService.tables.courses.tableName,
            IndexName: dynamoDBService.tables.courses.indexes.byInstructorID.indexName,
            KeyConditionExpression: 'instructorId = :instructorId',
            ExpressionAttributeValues: {
                ':instructorId': instructorId
            },
            Limit: 1
        };
        const result = await dynamoDBService.docClient.query(params).promise();
        return result.Items[0];
    }
    static async create(body) {
        try {
            const {
                courseName,
                price,
                courseCategory,
                courseDuration,
                courseImage,
                operatingSystem,
                description,
                status = 'active',
                isApproved = 'pending',
                instructorId,
                universityImage,
                operatingSystemImage,
                start_date,
                end_date
            } = body;
            const id = new ObjectId().toString();
            const courseItem = {
                id: id,
                courseName: courseName,
                courseNameLower: courseName.toLowerCase(),
                price: price,
                courseCategory: courseCategory,
                courseDuration: courseDuration,
                courseImage: courseImage,
                operatingSystem: operatingSystem,
                description: description,
                status: status,
                isApproved: isApproved,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                instructorId: instructorId,
                universityImage: universityImage,
                operatingSystemImage: operatingSystemImage,
                start_date: moment(start_date).format('YYYY-MM-DD'),
                end_date: moment(end_date).format('YYYY-MM-DD')
            }
            await dynamoDBService.dynamoDB.describeTable({ TableName: dynamoDBService.tables.courses.tableName }).promise();
            await dynamoDBService.putItem('courses', courseItem, 'attribute_not_exists(id)');
            return courseItem;
        } catch (error) {
            console.error('Error creating course --- :', error);
            throw error;
        }
    }
    static async update(body) {
        try {
            const { courseName, price, courseCategory, courseDuration, courseImage, description, operatingSystem, courseId, isApproved, published, start_date, end_date, operatingSystemImage, universityImage } = body;
            const updatedAt = new Date().toISOString();
            const courseNameLower = courseName ? courseName.toLowerCase() : '';
            const params = {
                TableName: dynamoDBService.tables.courses.tableName,
                Key: {
                    id: courseId
                },
                UpdateExpression: `
                    SET courseName           = :courseName,
                        courseNameLower      = :courseNameLower,   
                        price                = :price,
                        courseCategory       = :courseCategory,
                        courseDuration       = :courseDuration,
                        description          = :description,
                        operatingSystem      = :operatingSystem,
                        courseImage          = :courseImage,
                        updatedAt            = :updatedAt,
                        isApproved           = :isApproved,
                        operatingSystemImage = :operatingSystemImage,
                        start_date           = :start_date,
                        end_date             = :end_date,
                        published            = :published,
                        universityImage      = :universityImage
                `,
                ExpressionAttributeValues: {
                    ':courseName': courseName,
                    ':courseNameLower' : courseNameLower,
                    ':price': price,
                    ':courseCategory': courseCategory,
                    ':courseDuration': courseDuration,
                    ':description': description,
                    ':courseImage': courseImage,
                    ':operatingSystem': operatingSystem,
                    ':operatingSystemImage': operatingSystemImage,
                    ':start_date': moment(start_date).format('YYYY-MM-DD'),
                    ':end_date': moment(end_date).format('YYYY-MM-DD'),
                    ':published': published,
                    ':isApproved': isApproved,
                    ':updatedAt': updatedAt,
                    ':universityImage': universityImage
                },
                ReturnValues: 'ALL_NEW'
            };
            const result = await dynamoDBService.docClient.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error("Error updating course:", error);
            throw new Error("Could not update the course data.");
        }
    }
    static async delete(id) {
        try {
            const params = {
                TableName: dynamoDBService.tables.courses.tableName,
                Key: {
                    id: id
                },
            };
            const result = await dynamoDBService.docClient.delete(params).promise();
            return result;
        } catch (error) {
            console.error("Error deleting course:", error);
            throw new Error("Could not delete the course.");
        }
    }

    static async list(instructorId = null, limit = 10, page = 1, searchText = '') {
        try {
            const offset = (page - 1) * limit;
            let params = {
                TableName: dynamoDBService.tables.courses.tableName,
                Limit: limit,
                ExclusiveStartKey: null,
                ScanIndexForward: false
            };

            if (instructorId) {
                params = {
                    ...params,
                    IndexName: dynamoDBService.tables.courses.indexes.byInstructorID.indexName,
                    KeyConditionExpression: 'instructorId = :instructorId',
                    ExpressionAttributeValues: {
                        ':instructorId': instructorId
                    }
                };
            }

            if (searchText) {
                params.FilterExpression = 'contains(#courseName, :searchText)';
                params.ExpressionAttributeNames = {
                    '#courseName': 'courseName'
                };
                params.ExpressionAttributeValues = {
                    ...params.ExpressionAttributeValues,
                    ':searchText': searchText
                };
            }

            let allItems = [];
            let totalCount = 0;

            if (offset > 0) {
                let scannedCount = 0;
                do {
                    const data = instructorId
                        ? await dynamoDBService.docClient.query(params).promise()
                        : await dynamoDBService.docClient.scan(params).promise();

                    allItems = [...allItems, ...(data.Items || [])];
                    scannedCount += data.ScannedCount || 0;
                    params.ExclusiveStartKey = data.LastEvaluatedKey;

                    if (allItems.length >= offset + limit || !data.LastEvaluatedKey) {
                        break;
                    }
                } while (params.ExclusiveStartKey);
            } else {
                const data = instructorId
                    ? await dynamoDBService.docClient.query(params).promise()
                    : await dynamoDBService.docClient.scan(params).promise();

                allItems = data.Items || [];
            }

            if (!totalCount) {
                const countParams = { ...params, Select: 'COUNT' };
                delete countParams.Limit;
                delete countParams.ExclusiveStartKey;

                const countData = instructorId
                    ? await dynamoDBService.docClient.query(countParams).promise()
                    : await dynamoDBService.docClient.scan(countParams).promise();

                totalCount = countData.Count || 0;
            }

            const paginatedItems = allItems.slice(offset, offset + limit);
            const totalPages = Math.ceil(totalCount / limit);

            return {
                success: true,
                courses: paginatedItems,
                pagination: {
                    totalFetched: paginatedItems.length,
                    currentPage: parseInt(page),
                    limit,
                    hasMore: offset + limit < totalCount,
                    totalPages,
                    totalCount
                }
            };
        } catch (error) {
            console.error('Error fetching course list:', error);
            throw new Error(`Failed to fetch courses: ${error.message}`);
        }
    }

    static async deleteByInstructorId(instructorId) {
        try {
            const queryParams = {
                TableName: dynamoDBService.tables.courses.tableName,
                IndexName: dynamoDBService.tables.courses.indexes.byInstructorID.indexName,
                KeyConditionExpression: 'instructorId = :instructorId',
                ExpressionAttributeValues: {
                    ':instructorId': instructorId
                }
            };
            let lastEvaluatedKey = null;
            do {
                if (lastEvaluatedKey) {
                    queryParams.ExclusiveStartKey = lastEvaluatedKey;
                }
                const data = await dynamoDBService.docClient.query(queryParams).promise();
                lastEvaluatedKey = data.LastEvaluatedKey;
                const deleteRequests = (data.Items || []).map(item => ({
                    DeleteRequest: {
                        Key: { id: item.id }
                    }
                }));
                for (let i = 0; i < deleteRequests.length; i += 25) {
                    const batch = deleteRequests.slice(i, i + 25);
                    const deleteParams = {
                        RequestItems: {
                            [dynamoDBService.tables.courses.tableName]: batch
                        }
                    };
                    await dynamoDBService.docClient.batchWrite(deleteParams).promise();
                }
            } while (lastEvaluatedKey);
            return { success: true };
        } catch (error) {
            console.error("Bulk delete by instructorId failed:", error);
            throw new Error("Bulk delete failed.");
        }
    }
    static async updateStatus(courseId, status, reason = '') {
        try {
            const params = {
                TableName: dynamoDBService.tables.courses.tableName,
                Key: {
                    id: courseId
                },
                UpdateExpression: 'SET isApproved = :isApproved, reason = :reason',
                ExpressionAttributeValues: {
                    ':isApproved': status,
                    ':reason': reason
                },
                ReturnValues: 'ALL_NEW'
            };
            const result = await dynamoDBService.docClient.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error("Error updating status:", error);
            throw new Error("Could not update the course status.");
        }
    }
    static async updatePublication(courseId, status, reason = '', imageId = '') {
        try {
            const params = {
                TableName: dynamoDBService.tables.courses.tableName,
                Key: {
                    id: courseId
                },
                UpdateExpression: 'SET published = :published, reason = :reason, operatingSystemImage = :imageId',
                ExpressionAttributeValues: {
                    ':published': status,
                    ':reason': reason,
                    ':imageId': imageId || ''
                },
                ReturnValues: 'ALL_NEW'
            };
            const result = await dynamoDBService.docClient.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error("Error updating status:", error);
            throw new Error("Could not update the course status.");
        }
    }
    static async courseDetail(id) {
        try {
            const courseData = await dynamoDBService.docClient.get({
                TableName: dynamoDBService.tables.courses.tableName,
                Key: { id }
            }).promise();
            const course = courseData.Item;
            if (!course) {
                return {
                    success: false,
                    code: 404,
                    message: 'Course not found'
                };
            }
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
                    // ProjectionExpression: '#org, #pic',
                    // ExpressionAttributeNames: {
                    //     '#org': 'organization',
                    //     '#pic': 'profilePic'
                    // }
                }).promise().then(res => res.Items?.[0] || null)
            ]);

            course.instructor = instructor;
            course.instructorMetaData = instructorMetaData;
            course.start_date = course.start_date ? purchasedAt(course.start_date) : 'N/A';
            course.end_date = course.end_date ? purchasedAt(course.end_date) : 'N/A';
            return {
                success: true,
                code: 200,
                course
            };
        } catch (error) {
            console.error('UserModel.courseDetail Error:', error);
            return {
                success: false,
                code: 500,
                message: error.message
            };
        }
    }
    static async findByCourseIds(courseIds){
        try {
            const TABLE_NAME        = dynamoDBService.tables.courses.tableName;
            const docClient         = dynamoDBService.docClient;
            const ATTRIBUTES        = ['courseName', 'price', 'courseImage','id','start_date','end_date','instructorId'];  
            if (!Array.isArray(courseIds) || courseIds.length === 0) return [];
            const uniqueIds = [...new Set(courseIds)]; 
            const chunks = [];
            while (uniqueIds.length) chunks.push(uniqueIds.splice(0, 100));
            const results = [];
            for (const chunk of chunks) {
                const params = {
                    RequestItems: {
                        [TABLE_NAME]: {
                            Keys: chunk.map(id => ({ id: id })),
                            ProjectionExpression: ATTRIBUTES.join(', ')
                        }
                    }
                };
                const resp = await docClient.batchGet(params).promise();
                if (resp.Responses && resp.Responses[TABLE_NAME]) {
                    resp.Responses[TABLE_NAME].forEach(item => {
                        results.push({
                            courseId:    item.id,
                            courseName:  item.courseName,
                            price:       Number(item.price),
                            courseImage: item.courseImage,
                            startDate : item.start_date ? purchasedAt(item.start_date) : "N/A",
                            endDate: item.end_date ? purchasedAt(item.end_date) : "N/A",
                            instructorId: item.instructorId
                        });
                    });
                }
                if (resp.UnprocessedKeys && Object.keys(resp.UnprocessedKeys).length) {
                    params.RequestItems = resp.UnprocessedKeys;
                    const retryResp = await docClient.batchGet(params).promise();
                    retryResp.Responses[TABLE_NAME]?.forEach(item => results.push({
                        courseId:    item.id,
                        courseName:  item.courseName,
                        price:       Number(item.price),
                        courseImage: item.courseImage,
                        startDate : item.start_date ? purchasedAt(item.start_date) : "N/A",
                        endDate: item.end_date ? purchasedAt(item.end_date) : "N/A",
                        instructorId: item.instructorId
                    }));
                }
            }
            return results;
        } catch (error) {
            console.log(error)
        }
    }
    static async listPurchasedCourses(limit = 10, page = 1, searchText = '', instructorId = '') {
        try {
            const offset = (page - 1) * limit;
            const paidOrders = [];
            let ExclusiveStartKey = null;
            do {
                const data = await dynamoDBService.docClient.scan({
                    TableName: dynamoDBService.tables.orders.tableName,
                    FilterExpression: 'paymentStatus = :sid',
                    ExpressionAttributeValues: { ':sid': 'paid' },
                    // ExclusiveStartKey,
                }).promise();
                paidOrders.push(...(data.Items || []));
                ExclusiveStartKey = data.LastEvaluatedKey;
            } while (ExclusiveStartKey);
            if (paidOrders.length === 0) return { success: true, purchases: [], pagination: {} };
            const orderIdSet = new Set(paidOrders.map(o => o.id));
            const userIdSet = new Set(paidOrders.map(o => o.userId));
            const orderItemsData = await dynamoDBService.docClient.scan({
                TableName: dynamoDBService.tables.order_items.tableName
            }).promise();
            const relevantOrderItems = orderItemsData.Items.filter(i => orderIdSet.has(i.orderId));
            const uniquePairs = new Map();
            for (const item of relevantOrderItems) {
                const order = paidOrders.find(o => o.id === item.orderId);
                if (!order) continue;

                const key = `${order.userId}_${item.courseId}`;
                if (!uniquePairs.has(key)) {
                    uniquePairs.set(key, {
                        orderId: order.id,
                        userId: order.userId,
                        courseId: item.courseId,
                        purchaseDate: order.createdAt,
                        paymentStatus: order.paymentStatus
                    });
                }
            }
            const allPairs = Array.from(uniquePairs.values()).sort((a, b) =>
                new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
            );
            const userIds = [...new Set(allPairs.map(p => p.userId))];
            const courseIds = [...new Set(allPairs.map(p => p.courseId))];
            const userBatch = await dynamoDBService.docClient.batchGet({
                RequestItems: {
                [dynamoDBService.tables.users.tableName]: {
                    Keys: userIds.map(id => ({ id }))
                }
                }
            }).promise();
            const courseBatch = await dynamoDBService.docClient.batchGet({
                RequestItems: {
                    [dynamoDBService.tables.courses.tableName]: {
                        Keys: courseIds.map(id => ({ id }))
                    }
                }
            }).promise();
            const courseList = courseBatch.Responses?.[dynamoDBService.tables.courses.tableName] || [];
            const userMap = Object.fromEntries((userBatch.Responses?.[dynamoDBService.tables.users.tableName] || []).map(u => [u.id, u]));
            const courseMap = Object.fromEntries(courseList.map(c => [c.id, c]));
            const instructorIds = [...new Set(courseList.map(c => c.instructorId).filter(Boolean))];
            const instructorBatch = await dynamoDBService.docClient.batchGet({
                RequestItems: {
                    [dynamoDBService.tables.users.tableName]: {
                        Keys: instructorIds.map(id => ({ id }))
                    }
                }
            }).promise();
            const instructorMap = Object.fromEntries((instructorBatch.Responses?.[dynamoDBService.tables.users.tableName] || []).map(i => [i.id, i]));
            let results = allPairs.reduce((acc, p) => {
                const course = courseMap[p.courseId];
                if (!course || !course.courseName) return acc;
                const instructorName = course.instructorId ? (instructorMap[course.instructorId]?.fullName || 'N/A') : 'N/A';
                acc.push({
                    studentName: userMap[p.userId]?.fullName || 'N/A',
                    courseName: course.courseName,
                    courseId: p.courseId,
                    purchaseDate: purchasedAt(p.purchaseDate),
                    paymentStatus: p.paymentStatus,
                    courseDescription: course.description || 'N/A',
                    coursePrice: course.price || 'N/A',
                    courseImage: course.courseImage || 'N/A',
                    courseDuration: course.courseDuration || 'N/A',
                    instructorName,
                    orderId: p.orderId,
                    startDate: course.start_date ? purchasedAt(course.start_date) : 'N/A',
                    endDate: course.end_date ? purchasedAt(course.end_date) : 'N/A'
                });
                return acc;
            }, []);
            if (searchText) {
                const searchLower = searchText.toLowerCase();
                results = results.filter(r =>
                    r.studentName.toLowerCase().includes(searchLower) ||
                    r.courseName.toLowerCase().includes(searchLower) || 
                    r.instructorName.toLowerCase().includes(searchLower)
                );
            }
            if (instructorId) {
                results = results.filter(r => courseMap[r.courseId]?.instructorId === instructorId);
            }
            const totalCount = results.length;
            const paginatedItems = results.slice(offset, offset + limit);
            const totalPages = Math.ceil(totalCount / limit);

            return {
                success: true,
                purchases: paginatedItems,
                pagination: {
                    totalFetched: paginatedItems.length,
                    currentPage: page,
                    limit,
                    hasMore: offset + limit < totalCount,
                    totalPages,
                    totalCount
                }
            };
        } catch (error) {
            console.log(error);
            return { success: false, message: error };
        }
        
    }
    static async studentPurchasedCoursesCount(courseId) {
        const params = {
            TableName: dynamoDBService.tables.order_items.tableName,
            FilterExpression: 'courseId = :cid',
            ExpressionAttributeValues: {
            ':cid': courseId
            },
            Select: 'COUNT' 
        };
        try {
            const result = await dynamoDBService.docClient.scan(params).promise();
            return result.Count || 0;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    static async invoiceDetail(orderId, courseId) {
        try {
            const orderResult = await dynamoDBService.docClient.get({
                TableName: dynamoDBService.tables.orders.tableName,
                Key: { id: orderId },
            }).promise();
            const order = orderResult.Item;
            if (!order) {
                return { success: false, message: "Order not found" };
            }
            const userResult = await dynamoDBService.docClient.get({
                TableName: dynamoDBService.tables.users.tableName,
                Key: { id: order.userId },
            }).promise();
            const user = userResult.Item;
            const orderItemsResult = await dynamoDBService.docClient.query({
                TableName: dynamoDBService.tables.order_items.tableName,
                IndexName: 'OrderIndex',
                KeyConditionExpression: '#orderId = :oid',
                FilterExpression: '#courseId = :cid',
                ExpressionAttributeNames: {
                    '#orderId': 'orderId',
                    '#courseId': 'courseId'
                },
                ExpressionAttributeValues: {
                    ':oid': orderId,
                    ':cid': courseId
                }
            }).promise();
            const matchedOrderItem = orderItemsResult.Items?.[0];
            if (!matchedOrderItem) {
                return { success: false, message: "Course not found in this order" };
            }
            const courseResult = await dynamoDBService.docClient.get({
                TableName: dynamoDBService.tables.courses.tableName,
                Key: { id: courseId },
            }).promise();
            const course = courseResult.Item;
            if (!course) {
                return { success: false, message: "Course not found" };
            }
            let instructor = null;
            if (course.instructorId) {
                const instructorResult = await dynamoDBService.docClient.get({
                    TableName: dynamoDBService.tables.users.tableName,
                    Key: { id: course.instructorId },
                }).promise();
                instructor = instructorResult.Item;
            }
            return {
                success: true,
                data: {
                    order: {
                        id: order.id,
                        createdAt: order.createdAt,
                        paymentMode: order.paymentMethod || 'N/A',
                    },
                    user: {
                        fullName: user?.fullName || 'N/A',
                        email: user?.email || 'N/A',
                        phone: user?.phoneNumber || 'N/A',
                    },
                    course: {
                        id: course.id,
                        name: course.courseName,
                        description: course.description || '',
                        image: course.courseImage || '',
                        duration: course.courseDuration || '',
                        price: course.price || 0,
                        startDate: course.start_date || '',
                        endDate: course.end_date || '',
                        instructorName: instructor?.fullName || 'N/A',
                    },
                },
            };
        } catch (error) {
            console.error("Invoice Fetch Error:", error);
            return { success: false, message: "Internal server error : " + error };
        }
    }

}
module.exports = Course;