const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, uploadProfileImage } = require('../controllers/userController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/profiles/' });

// routes สำหรับจัดการข้อมูลผู้ใช้
router.get('/profile', getUserProfile);    // ดึงข้อมูลผู้ใช้
router.put('/profile', updateProfile);     // แก้ไขข้อมูลผู้ใช้
router.post('/profile/image', uploadProfileImage);

module.exports = router; 