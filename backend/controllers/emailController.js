const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// โหลดค่าจากไฟล์ .env
dotenv.config();

// สร้าง transporter
const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true ,
            auth: {
                user: "zkaka185@gmail.com",
                pass: "womo jflu djzo zbvy",
            },
        });

// ฟังก์ชันสำหรับส่งอีเมลยืนยัน
async function sendVerificationEmail(email, username, token) {
    try {
        // สร้างข้อความ HTML สำหรับอีเมลยืนยัน
        const htmlMessage = `
    <h1>Hello ${username},</h1>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="http://localhost:5000/auth/verify?token=${token}">Verify Email</a>
`;


        // ส่งอีเมล
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM, // ผู้ส่ง
            to: email, // ผู้รับ
            subject: 'Email Verification', // หัวข้อ
            text: `Hello ${username}, Please verify your email address.`, // ข้อความ plain text
            html: htmlMessage, // ข้อความ HTML
        });

        console.log(`Verification email sent: ${info.messageId}`);
        return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
        console.error('Error sending verification email:', error.message);
        return { success: false, message: error.message };
    }
}

module.exports = {
    sendVerificationEmail,
};

// ฟังก์ชันสำหรับทดสอบการเชื่อมต่อ SMTP
const verifySMTP = () => {
    transporter.verify((error, success) => {
        if (error) {
            console.error("SMTP verification failed:", error); // ถ้ามีข้อผิดพลาด
        } else {
            console.log("SMTP server is ready to send emails"); // ถ้าเชื่อมต่อสำเร็จ
        }
    });
};

// เรียกใช้งานฟังก์ชันตรวจสอบการเชื่อมต่อ SMTP
verifySMTP();
