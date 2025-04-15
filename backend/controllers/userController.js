const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

// ฟังก์ชันสำหรับดึง userId จาก token
const getUserIdFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (error) {
        return null;
    }
};

// กำหนดการจัดเก็บไฟล์
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const dir = './uploads/profiles';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// กำหนดการกรองไฟล์
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('ไฟล์ที่อัพโหลดต้องเป็นรูปภาพเท่านั้น'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // จำกัดขนาดไฟล์ที่ 5MB
    }
});

// ฟังก์ชันดึงข้อมูลผู้ใช้
exports.getUserProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'ไม่พบ Token กรุณาเข้าสู่ระบบ'
            });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Token ไม่ถูกต้อง'
            });
        }

        const user = await User.findById(userId).select('-password -tokens');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลผู้ใช้'
            });
        }

        const userData = {
            username: user.username,
            lastname: user.lastname,
            email: user.email
        };

        // เพิ่มรูปโปรไฟล์ถ้ามี
        if (user.profileImage && user.profileImage.data) {
            userData.profileImage = `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`;
        }

        res.status(200).json({
            success: true,
            data: userData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
            error: error.message
        });
    }
};

// ฟังก์ชันแก้ไขข้อมูลผู้ใช้
exports.updateProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const { username, lastname } = req.body;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'ไม่พบ Token กรุณาเข้าสู่ระบบ'
            });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Token ไม่ถูกต้อง'
            });
        }

        if (!username || !lastname) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { username, lastname },
            { 
                new: true,
                runValidators: true
            }
        ).select('-password -tokens');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลผู้ใช้'
            });
        }

        res.status(200).json({
            success: true,
            message: 'อัพเดทข้อมูลสำเร็จ',
            data: {
                username: user.username,
                lastname: user.lastname,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล',
            error: error.message
        });
    }
};

// เพิ่มฟังก์ชันอัพโหลดรูปโปรไฟล์
exports.uploadProfileImage = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'ไม่พบ Token กรุณาเข้าสู่ระบบ'
            });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Token ไม่ถูกต้อง'
            });
        }

        // รับข้อมูล base64
        const { imageBase64, mimeType } = req.body;
        
        if (!imageBase64) {
            return res.status(400).json({
                success: false,
                message: 'ไม่พบข้อมูลรูปภาพ'
            });
        }

        // ตรวจสอบขนาดข้อมูล base64
        const base64WithoutPrefix = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const fileSize = Buffer.byteLength(base64WithoutPrefix, 'base64');
        
        // จำกัดขนาดที่ 5MB
        const maxSize = 5 * 1024 * 1024;
        if (fileSize > maxSize) {
            return res.status(400).json({
                success: false,
                message: 'ไฟล์รูปภาพมีขนาดใหญ่เกินไป (สูงสุด 5MB)'
            });
        }

        // แปลง base64 เป็น buffer
        const imageBuffer = Buffer.from(base64WithoutPrefix, 'base64');

        // อัพเดทข้อมูลผู้ใช้
        const user = await User.findByIdAndUpdate(
            userId,
            {
                profileImage: {
                    data: imageBuffer,
                    contentType: mimeType || 'image/jpeg'
                }
            },
            { new: true }
        ).select('-password -tokens');

        res.status(200).json({
            success: true,
            message: 'อัพโหลดรูปโปรไฟล์สำเร็จ',
            data: {
                profileImage: `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ',
            error: error.message
        });
    }
}; 