const express = require('express');
const router = express.Router();
const migrationController = require('.././controllers/migration/migration');
const { getCountries, getStatesByCountry, checkUsersExistsByEmail,uploadFileToS3, getOperationSystems } = require('.././controllers/commonController');
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
// router.post('/settings', SettingRequest.list, SettingController.list);
//table migration

router.get('/migration',migrationController.createTables);

//Get countries
router.get('/countries', getCountries);
//Get states
router.get('/states/:countryCode', getStatesByCountry);

router.post('/users/exists', checkUsersExistsByEmail)
// router.post('/upload-s3',upload.single("profilePic"),uploadFileToS3);
router.get('/operating-systems', getOperationSystems);

module.exports = router;