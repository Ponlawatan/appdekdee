const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

/// ฟังก์ชันส่งอีเมลรีเซ็ตรหัสผ่าน
exports.sendResetPasswordEmail = async (email, resetToken) => {
    try {
        // สร้าง transporter สำหรับส่งอีเมล
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "zkaka185@gmail.com",  // ใช้ email ของคุณ
                pass: "womo jflu djzo zbvy",  // ใช้ password หรือ app password
            },
        });

        // ลิงก์รีเซ็ตรหัสผ่าน
        const resetUrl = `http://localhost:5000/reset-password?token=${resetToken}`; // ใช้ localhost:5000

        // เนื้อหาอีเมล
        const mailOptions = {
            from: process.env.EMAIL_USER,  // อีเมลผู้ส่ง
            to: email,  // อีเมลผู้รับ
            subject: 'Reset Your Password',  // หัวข้ออีเมล
            html: `
                <h2>Reset Your Password</h2>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}" target="_blank">Reset Your Password</a>
                <p>This link will expire in 1 hour.</p>
            `, // เนื้อหาของอีเมล
        };

        // ส่งอีเมล
        await transporter.sendMail(mailOptions);
        return { success: true };  // ส่งสำเร็จ
    } catch (err) {
        console.error('Error sending reset password email:', err);
        return { success: false, message: err.message };  // เกิดข้อผิดพลาด
    }
};


