const HighestDegreeObtainedModel = require('../../models/highest_degree_obtained');
const CurrentlyEnrolledDegreeModel = require('../../models/currently_enrolled_degree');
const CertificationModel = require('../../models/certification');
const preferredWorkTypeModel = require('../../models/preferred_work_type');
const SecurityClearanceLevelModel = require('../../models/security_clearance_level');
const TechnicalSkillModel = require('../../models/technical_skill');
const WorkAuthorizationModel = require('../../models/work_authorization');

const { sendSuccess, sendError } = require('../../config/helpers/reponseHandler');

class UnauthorizedController {
    static async getHighestDegreeObtinaedData(req, res) {
        try {
          const highestDegreeObtainedData = await HighestDegreeObtainedModel.findAll();
          sendSuccess(res, highestDegreeObtainedData)
        } catch (err) {
          console.error("❌ Error fetching highest degree obtained data:", err);
          sendError(res, err)
        }
    }

    static async getcurrentlyEnrolledDegreeData(req, res) {
        try {
          const currentlyEnrolledDegreeData = await CurrentlyEnrolledDegreeModel.findAll();
          sendSuccess(res, currentlyEnrolledDegreeData)
        } catch (err) {
          console.error("❌ Error fetching Currently Enrolled Degree Model data:", err);
          sendError(res, err)
        }
    }

    static async getCertificationData(req, res) {
        try {
          const certificationData = await CertificationModel.findAll();
          sendSuccess(res, certificationData)
        } catch (err) {
          console.error("❌ Error fetching certification data:", err);
          sendError(res, err)
        }
    }

    static async getPreferredWorkTypeData(req, res) {
        try {
          const preferredWorkTypeData = await preferredWorkTypeModel.findAll();
          sendSuccess(res, preferredWorkTypeData)
        } catch (err) {
          console.error("❌ Error fetching Preferred Work Type data:", err);
          sendError(res, err)
        }
    }
    
    static async getSecurityClearanceLevelData(req, res) {
        try {
          const securityClearanceLevelData = await SecurityClearanceLevelModel.findAll();
          sendSuccess(res, securityClearanceLevelData)
        } catch (err) {
          console.error("❌ Error fetching Security Clearance Level Model data:", err);
          sendError(res, err)
        }
    }
       
    static async getTechnicalSkillData(req, res) {
        try {
          const technicalSkillData = await TechnicalSkillModel.findAll();
          sendSuccess(res, technicalSkillData)
        } catch (err) {
          console.error("❌ Error fetching Technical Skill Model data:", err);
          sendError(res, err)
        }
    }

    static async workAuthorizationData(req, res) {
        try {
          const workAuthorizationData = await WorkAuthorizationModel.findAll();
          sendSuccess(res, workAuthorizationData)
        } catch (err) {
          console.error("❌ Error fetching work Authorization data:", err);
          sendError(res, err)
        }
    }

}
module.exports = UnauthorizedController;