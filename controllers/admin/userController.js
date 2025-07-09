const UserModel = require('../../models/users');
const UserMetaData = require('../../models/users_meta_data');
const UserRoles = require('../../models/user_roles');
const InstructorMetaData = require('../../models/instructor_meta_data');
const sendMail = require('../../config/helpers/emailHelper');
const CommonHelper = require('../../config/helpers/common');
const HighestDegreeObtainedModel = require('../../models/highest_degree_obtained');
const CurrentlyEnrolledDegreeModel = require('../../models/currently_enrolled_degree');
const CertificationModel = require('../../models/certification');
const preferredWorkTypeModel = require('../../models/preferred_work_type');
const SecurityClearanceLevelModel = require('../../models/security_clearance_level');
const TechnicalSkillModel = require('../../models/technical_skill');
const WorkAuthorizationModel = require('../../models/work_authorization');
const { getDifferences } = require('../commonController');
const CognitoService = require('../../services/cognito');
const { generateSecurePassword } = require('../commonController');
const loginLink = `${process.env.FRONTEND_URL}${process.env.LOGIN_LINK}`;
const USER_ROLES  = require('../../config/enums/role');
module.exports = {
    getListing: async (req, res) => {
        try {
            const { role, status, limit = 10, page = 1, search = '' } = req.query;
            if (!role && !status && !search) {
                return res.status(400).json({
                    error: 'At least one filter parameter is required (role, status, or search)'
                });
            }
            const result = await UserModel.fetchAllUsersByRole({
                role,
                status,
                limit: parseInt(limit),
                page: parseInt(page),
                searchText: search
            });
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const sortedUsers = result?.users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const sanitizedUsers = sortedUsers.map((user, index) => {
                const { password, resetPasswordToken, resetPasswordExpires,cognitoSub ,...safeUser } = user;
                return {
                    ...safeUser,
                    createdAt: CommonHelper.formatDate(safeUser.createdAt, 'MMM d, yyyy'), 
                    updatedAt: CommonHelper.formatDate(safeUser.updatedAt, 'MM/dd/yyyy'),
                };
            });
            const finalUsers = sanitizedUsers.map((user, index) => ({
                ...user,
                serial: offset + index + 1,
            }));
            res.status(200).json({
                success: true,
                data: finalUsers,
                pagination: {
                    totalFetched: result.pagination.totalFetched,
                    page: result.pagination.currentPage,
                    totalPages: result.pagination.totalPages,
                    limit: result.pagination.limit,
                    hasMore: result.pagination.hasMore,
                    totalCount: result.pagination.totalCount
                }
            });
        } catch (error) {
            let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: errorMessage
            });
        }
    },
    getMetaData: async (req, res) => {
        try {
            const { userId } = req.query;
            if (!userId) {
                return res.status(422).json({
                    error: 'userId is required!'
                });
            }
            const user = await UserModel.findById(userId);
            const getRole = await UserRoles.getRoleName(user.role);
            let metaData = {};
            if (getRole.name == 'STUDENT') {
                metaData = await UserMetaData.findByUserId(userId);
            } else if (getRole.name === 'INSTRUCTOR') {
                metaData = await InstructorMetaData.findByUserId(userId);
            }
            const data = { user: user, metaData: metaData };
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: errorMessage
            });
        }
    },
    storeUser: async (req, res) => {
        try {
            const { email, fullName, rolename } = req.body;
            const user = await UserModel.findByEmail(email);
            if (user) {
                return res.status(401).json({ message: 'Email already exist!' });
            }
            const role = await UserRoles.getRoleId(req.body.rolename);
            if (!role) {
                return res.status(500).json({ message: 'Could not assign user role.' });
            }
            const password = generateSecurePassword(12);
            let address = '';
            if (rolename === USER_ROLES.STUDENT) {
                const country = req.body.country ? CommonHelper.getCountryNameByCountryCode(req.body.country) : "";
                const state = req.body.state ? CommonHelper.getStateNameByStateCode(req.body.country, req.body.state) : "";
                const city = req.body.city || "";
                const addressParts = [city, state, country].filter(Boolean);
                address = addressParts.join(", ");
            }
            const signupArgs = rolename === USER_ROLES.STUDENT ? [email, password, fullName, address] : [email, password, fullName];
            const cognitoResponse = await CognitoService.adminCreateAccount(...signupArgs);
            if (!cognitoResponse.success) {
                throw new Error(cognitoResponse.error);
            }
            const cognitoUserName = cognitoResponse.username;
            const cognitoSub = cognitoResponse.sub
            const message = rolename === USER_ROLES.STUDENT ? "Student account created successfully!" : "Instructor account created successfully!";
            let createdUser = {};
            if (rolename === USER_ROLES.STUDENT) {
                createdUser = await UserModel.create({
                    ...req.body,
                    role: role.roleId,
                    password: password,
                    cognitoUserName: cognitoUserName,
                    createdBy:USER_ROLES.ADMIN,
                    cognitoSub:cognitoSub
                });
            } else if (rolename === USER_ROLES.INSTRUCTOR) {
                createdUser = await InstructorMetaData.create({
                    ...req.body,
                    role: role.roleId,
                    password: password,
                    cognitoUserName: cognitoUserName,
                    createdBy:USER_ROLES.ADMIN,
                    cognitoSub:cognitoResponse.sub,
                });
            }
            const emailResponse = await sendMail({
                to: email,
                subject: 'Welcome! Your Account Has Been Successfully Created',
                template: 'account-created',
                templateData: {
                    userName: `${fullName}`,
                    password:password,
                    email:email,
                    loginLink:loginLink,
                    rolename:req.body.rolename
                }
            });
            return res.status(201).json({ message: message, createdUser: createdUser });
        } catch (error) {
            let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: errorMessage
            });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const { userId, rolename } = req.query;
            if(!userId || !rolename){
                return res.status(422).json({
                    success:false,
                    messageL:"User id or rolename is required"
                })
            }
            const user = await UserModel.findById(userId);
            if(user && user.cognitoUserName){
                const response = await CognitoService.deleteUser(user.cognitoUserName);
                if(!response.success){
                    return res.status(500).json({ success: false, message : "Error while deleting user", exception: error});
                }
            }
            const result = await UserModel.delete(userId, rolename);
            if (result) {
                return res.status(200).json({
                    success: true,
                    message: "Account has been deleted successfully"
                });
            }
            throw new Error("Error While Deleting");
        } catch (error) {
            let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: errorMessage
            });
        }
    },
    statusChange: async (req, res) => {
        try {
            const { userId, status } = req.body;
            const user = await UserModel.findById(userId);
            const result = await UserModel.updateStatus(userId, status);
            if (result) {
                if (user.isApproved === 'pending' && status === 'active') {
                    await sendMail({
                        to: user.email,
                        subject: 'Account Approved',
                        template: 'account-approved',
                        templateData: {
                            userName: `${user.fullName}`,
                        }
                    });
                }else if(status === 'suspended'){
                    await sendMail({
                        to: user.email,
                        subject: 'Account Suspended',
                        template: 'account-suspended',
                        templateData: {
                            userName: `${user.fullName}`,
                        }
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Status changed successfully!"
                });
            }
            throw new Error("Error while changing status");
        } catch (error) {
            let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: errorMessage
            });
        }
    },
    getEditUser : async (req,res) => {
        try {
            const { userId } = req.query;
            const user = await UserModel.findById(userId);
            if(!user){
                return res.status(403).json({
                    success:false,
                    message:"User not found"
                });
            }
            const role = user.role;
            const rolename = await UserRoles.getRoleName(role);
            if(!rolename){
                return res.status(403).json({
                    success:false,
                    message:"User's role not found"
                });
            }
            let metaData = {};
            if(rolename.name === "STUDENT"){
                metaData = await UserMetaData.findByUserId(userId);
            }else if(rolename.name === "INSTRUCTOR"){
                metaData = await InstructorMetaData.findByUserId(userId);
            }
            return res.status(200).json({
                success:true,
                message:"Data fetched successfully",
                data:{ user: user, metaData : metaData}
            })
        } catch (error) {
            let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: errorMessage
            });
        }
    },
    updateUser : async (req,res) => {
        try {
            const { userId ,rolename,email } = req.body;
            if(!rolename || !userId){
                return res.status(422).json({
                    success: false,
                    message: "Role name or user id is required!"
                });
            }
            const existingUser = await UserModel.findById(userId);
            let existingMeta = {};
            if (rolename === "STUDENT") {
                existingMeta = await UserMetaData.findByUserId(userId);
            } else if (rolename === "INSTRUCTOR") {
                existingMeta = await InstructorMetaData.findByUserId(userId);
            }
            const result = await UserModel.updateUser(userId,rolename,req.body);
            if(result){
                const baseFieldsChanged = getDifferences(existingUser, req.body, ['email', 'fullName', 'phoneNumber']);
                let metaFieldsChanged;
                if (rolename === USER_ROLES.STUDENT) { 
                    metaFieldsChanged = getDifferences(existingMeta, req.body, ['country','state','city','linkedin','portfolio','highestDegree', 'currentlyEnrolled','university','graduationDate','yearsOfExperience','certifications','otherCertification','securityClearance','workAuthorization','workType','activelySeeking','profileVisible','technicalSkills']);
                }  else if (rolename === USER_ROLES.INSTRUCTOR) {
                    metaFieldsChanged = getDifferences(existingMeta, req.body, ['bio','jobTitle','expectedStudents','topicTeach','organization','profilePic']);
                }
                let updatedFieldsHtml = '';
                const updatedFields = {
                    userTable: baseFieldsChanged,
                    metaTable: metaFieldsChanged
                }
                if ((updatedFields.metaTable && Object.keys(updatedFields.metaTable).length > 0) || (updatedFields.userTable && Object.keys(updatedFields.userTable).length > 0)) {
                    let highestDegreeObtainedData,currentlyEnrolledDegreeData,certificationData,preferredWorkTypeData,securityClearanceLevelData,technicalSkillData,workAuthorizationData = [];
                    if (req.body.highestDegree) {
                        try {
                            highestDegreeObtainedData = await HighestDegreeObtainedModel.findAll();
                        }
                        catch (error) {
                            console.error('Error fetching highest degree obtained data:', error);
                            highestDegreeObtainedData = []
                        }
                    }
                    if (req.body.currentlyEnrolled) {
                        try {
                            currentlyEnrolledDegreeData = await CurrentlyEnrolledDegreeModel.findAll();
                        }
                        catch (error) {
                            console.error('Error fetching currently enrolled degree data:', error);
                            currentlyEnrolledDegreeData = []
                        }
                    }
                    if (req.body.certifications) {
                        try {
                            certificationData = await CertificationModel.findAll();
                        }catch (error) {
                            console.error('Error fetching certification data:', error);
                            certificationData = []
                        }
                    }
                    if (req.body.workType) {
                        try {
                            preferredWorkTypeData = await preferredWorkTypeModel.findAll();
                        }catch (error) {
                            console.error('Error fetching preferred work type data:', error);
                            preferredWorkTypeData = []
                        }
                    }
                    if (req.body.securityClearance) {
                        try {
                            securityClearanceLevelData = await SecurityClearanceLevelModel.findAll();
                        }catch (error) { 
                            console.error('Error fetching security clearance level data:', error);
                            securityClearanceLevelData = []
                        }
                    }
                    if (req.body.technicalSkills) {
                        try {
                            technicalSkillData = await TechnicalSkillModel.findAll();
                        }catch (error) {
                            console.error('Error fetching technical skill data:', error);
                            technicalSkillData = []
                        }
                    }
                    if (req.body.workAuthorization) {
                        try {
                            workAuthorizationData = await WorkAuthorizationModel.findAll();
                        } catch (error) {
                            console.error('Error fetching work authorization data:', error);
                            workAuthorizationData = []
                        }
                    }
                    Object.entries(updatedFields).forEach(([table, changes]) => {
                        Object.entries(changes).forEach(([key, value]) => {
                            if (value && value.new) {
                                if (table === 'metaTable') {
                                    if (key === 'highestDegree') {
                                        const degree = highestDegreeObtainedData.find(d => parseInt(d.id) == parseInt(value.new));
                                        value.new = degree ? degree.name : "";
                                        key = 'Highest Degree';
                                    } else if (key === 'currentlyEnrolled') {
                                        const enrolled = currentlyEnrolledDegreeData.find(e => e.id == value.new);
                                        value.new = enrolled ? enrolled.name : value.new;
                                        key = 'Currently Enrolled';
                                    } else if (key === 'certifications') {
                                        const cert = certificationData.filter(c => value.new.includes(c.id)).map(w => w.name);
                                        let otherCertification = '';
                                        if (req.body.certifications.includes(9)) {
                                            otherCertification = req.body.otherCertification;
                                        }
                                        const oldCertificationsString = typeof value.new === 'string' ? value.new : '';
                                        const oldCertifications = oldCertificationsString.split(',').map(c => c.trim());
                                        let newCertificationsArray = [...cert];
                                        const oldOtherCertification = oldCertifications.find(c => !cert.includes(c));
                                        if (otherCertification) {
                                            if (!oldOtherCertification || oldOtherCertification !== otherCertification) {
                                                newCertificationsArray.push(otherCertification);
                                            }
                                        }
                                        let filterednewCertificationsArray = newCertificationsArray.filter(value => value !== 'Other');
                                        if(newCertificationsArray.length > 0) {
                                            const newCertifications = filterednewCertificationsArray.join(', ');
                                            if (oldCertificationsString !== newCertifications) {
                                                value.new = newCertifications;
                                            }
                                        }else{
                                            value.new = "All removed";
                                        }
                                        key = 'Certifications';
                                    }
                                     else if (key === 'workType') {
                                        const matchedNames = preferredWorkTypeData.filter(w => value.new.includes(w.id)).map(w => w.name);
                                        value.new = matchedNames.length > 0 ? matchedNames.join(', ') : "";
                                        key = 'Work Type';
                                    } else if (key === 'securityClearance') {
                                        const clearance = securityClearanceLevelData.find(s => s.id == value.new);
                                        value.new = clearance ? clearance.name : value.new;
                                        key = 'Security Clearance';
                                    } else if (key === 'technicalSkills') {
                                        const skill = technicalSkillData.filter(t => value.new.includes(t.id)).map(t => t.name);
                                        value.new = skill.length > 0 ? skill.join(', ') : "";
                                        key = 'Technical Skills';
                                    } else if (key === 'workAuthorization') {
                                        const auth = workAuthorizationData.find(w => w.id == value.new);
                                        value.new = auth ? auth.name : value.new;
                                        key = 'Work Authorization';
                                    } else if(key === 'activelySeeking') {
                                        value.new = req.body.activelySeeking === true || req.body.activelySeeking === 'true' ? "Yes" : "No";
                                        key = 'Actively Seeking';
                                    } else if(key === 'profileVisible') {
                                        value.new = req.body.profileVisible === true || req.body.profileVisible === 'true' ? "Yes" : "No";
                                        key = 'Profile Visible';
                                    } else if(key === 'yearsOfExperience') {
                                        key = 'Years Of Experience';
                                    } else if (key === 'jobTitle') {
                                        key = 'Job Title';
                                    } else if (key === 'expectedStudents') {
                                        key = 'Expected Students';
                                    } else if(key === 'topicTeach') {
                                        key = 'Topic Teach';
                                    } else if(key === 'organization') {
                                        key = 'Organization';
                                    } else if(key === 'profilePic'){
                                        key = 'Profile Pic';
                                    } 
                                }
                                if (key === 'graduationDate') {
                                    value.new = CommonHelper.formatDate(value.new, 'MMM d, yyyy');
                                    key = 'Graduation Date'
                                }
                                if (key === 'otherCertification') {
                                    key = 'Certifications'
                                }
                            }
                            updatedFieldsHtml += `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1) + " "}:</strong> ${value.new}</li>`;
                        });
                    });
                    
                }
                // return;
                if(updatedFieldsHtml != ''){
                    const emailResponse = await sendMail({
                        to: email,
                        subject: 'Updated! Your Account Has Been Updated',
                        template: 'account-updated',
                        templateData: {
                            userName: `${existingUser.fullName}`,
                            email:email,
                            updatedFieldsHtml:updatedFieldsHtml
                        }
                    });
                }
                const message = rolename === "STUDENT" ? "User account updated successfully" : "Instructor account updated successfully!";
                return res.status(200).json({
                    success:true,
                    message:message
                });
            }
            throw new Error("Something went wrong! Please try again after sometime");
        } catch (error) {
            let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: errorMessage,
            });
        }
    },
    // courseWorkspaceDetails: async (req, res) => {
    //     try {
    //         const { courseId } = req.query;

    //     } catch (error) {
    //         let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
    //         return res.status(500).json({
    //             success: false,
    //             error: 'Internal server error',
    //             message: errorMessage,
    //         });
    //     }
    // }
}