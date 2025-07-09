const CommonHelper = require('../config/helpers/common');
const { sendSuccess, sendError } = require('../config/helpers/reponseHandler');
const UserModel = require('../models/users');
const AWS = require("aws-sdk");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const crypto = require('crypto');
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const getCountries = (req, res) => {
  try {
    const countries = CommonHelper.getAllCountries();
    sendSuccess(res, countries);
  } catch (err) {
    sendError(res, err);
  }
};
/**
 * Uploads a file to S3
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} originalName - Original file name
 * @param {string} mimeType - File MIME type
 * @param {string} folder - Folder name inside bucket (optional)
 * @returns {Promise<string>} - The public URL of uploaded file
 */
const uploadFileToS3 = async (req,res) => {
  try {
    const originalName = req.file.originalname;
    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype
    const folder = "instructors/";
    const extension = path.extname(originalName);
    const uniqueName = `${folder}${uuidv4()}${extension}`;
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(mimeType)) {
      return sendError(res, "Invalid file type",400);
    }
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uniqueName,
      Body: fileBuffer,
      ContentType: mimeType,
    };
    const data = await s3.upload(params).promise();
    return sendSuccess(res, { url : data.Location },"Url fetched successfully");
  } catch (error) {
    console.log("err", error)
    sendError(res, error);
  }
  
};
const getStatesByCountry = (req, res) => {
  try {
    const { countryCode } = req.params;
    const states = CommonHelper.getStatesByCountryCode(countryCode);
    sendSuccess(res, states);
  } catch (err) {
    console.log("err", err)
    sendError(res, err);
  }
};

const checkUsersExistsByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findByEmail(email);
    if (user) {
      sendSuccess(res, { exists: true });
    } else {
      sendSuccess(res, { exists: false });
    }
  } catch (err) {
    sendError(res, err);
  }
}
const getDifferences = (oldData = {}, newData = {}, compareKeys = null) => {
  const changes = {};
  const keysToCompare = compareKeys || Object.keys(newData);
  keysToCompare.forEach((key) => {
    const newVal = newData[key];
    const oldVal = oldData[key];
    let newValString = newVal != null ? String(newVal).trim() : '';
    if(key === "graduationDate"){
      newValString = newVal != null ? newVal.toISOString() : '';
    }
    const oldValString = oldVal != null ? String(oldVal).trim() : '';
    if (newValString !== oldValString) {
      changes[key] = {
        old: oldVal,
        new: newVal
      };
    }
  });
  return changes;
};
const generateSecurePassword = (length = 12) => {
  if (length < 9) length = 9;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '@$!%*?&';
  const allChars = uppercase + lowercase + numbers + specialChars;
  const getRandomChar = (chars) => chars[Math.floor(Math.random() * chars.length)];
  const passwordChars = [
    getRandomChar(uppercase),
    getRandomChar(lowercase),
    getRandomChar(numbers),
    getRandomChar(specialChars),
  ];
  while (passwordChars.length < length) {
    passwordChars.push(getRandomChar(allChars));
  }
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }
  return passwordChars.join('');
};
const getSecretHash = (username,client_secret,client_id) => {
  if (!client_secret) {
    throw new Error('client_secret is undefined!');
  }
  return crypto.createHmac('SHA256', client_secret).update(username + client_id).digest('base64');
}
const generateUsername = (fullName) => {
  const sanitized = fullName
      .toLowerCase()
      .replace(/[^a-z0-9_-]/gi, '_')
      .replace(/_+/g, '_')
      .substring(0, 30);
  const random = Math.floor(Math.random() * 10000);
  return `${sanitized}_${random}`;
}

const getOperationSystems = (req, res) => {
  try {
    const data = [
      {
        label: 'Windows',
        value: 'WINDOWS'
      },
      {
        label: 'Linux',
        value: 'LINUX'
      },
      {
        label: 'Ubuntu',
        value: 'UBUNTU'
      }
    ];
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = {
  getCountries,
  getStatesByCountry,
  checkUsersExistsByEmail,
  uploadFileToS3,
  getDifferences,
  generateSecurePassword,
  getSecretHash,
  generateUsername,
  getOperationSystems
};
