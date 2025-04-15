const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: false }, // ไม่เป็น unique
    lastname: { type: String, required: true, unique: false },  // ไม่เป็น unique
    email: { type: String, required: true, unique: true }, // ต้อง unique
    password: { type: String, required: true }, // เก็บรหัสผ่าน (ควรเข้ารหัสก่อนเก็บ)
    profileImage: {
        data: Buffer,
        contentType: String
    },
    isVerified: { type: Boolean, default: false }, // ระบุสถานะการยืนยัน
    verificationToken: { type: String, required: false }, // เก็บ Token สำหรับยืนยันอีเมล
    tokens: [{ token: String }], // เก็บ JWT Token หลายค่า (ในกรณีที่ผู้ใช้ล็อกอินในหลายอุปกรณ์)
    resetPasswordToken: { type: String, required: false }, // Token สำหรับรีเซ็ตรหัสผ่าน
    resetPasswordExpires: { type: Date, required: false }, // วันหมดอายุของ token
    favoritePlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }], // เพิ่มฟิลด์นี้
}, { timestamps: true }); // เปิดใช้งาน timestamps เพื่อบันทึก createdAt, updatedAt

module.exports = mongoose.model('User', userSchema);

