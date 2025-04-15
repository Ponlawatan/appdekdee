const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, logout, sendVerificationEmail, getProfile, refreshToken, getUserProfile } = require('../controllers/authController');

// Route สำหรับการลงทะเบียน
router.post('/register', register);

// กำหนด Route สำหรับ verifyEmail
router.get('/verify', sendVerificationEmail);

// Route สำหรับ Login
router.post('/login', login);

// Route สำหรับ Logout โดยใช้ Token
router.post('/logout', logout);

// Routing สำหรับ forgot password
router.post('/forgot-password', forgotPassword); 

// Routing สำหรับ reset password
router.post('/reset-password', resetPassword);

// Route สำหรับ Profile (ต้องมีการตรวจสอบ Token)
router.get('/profile', getProfile);

// Route สำหรับ refresh token
router.post('/refresh-token', refreshToken); // เพิ่มการรีเฟรช Token

// เพิ่ม route สำหรับดึงข้อมูลผู้ใช้
router.get('/user-profile', getUserProfile);

module.exports = router;
