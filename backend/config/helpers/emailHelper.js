const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs').promises;
const htmlToText = require('html-to-text');
const logoUrl = process.env.LOGO_URL;
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function renderTemplate(template, data = {}) {
    const templatePath = path.join(__dirname, '../../views/emails', `${template}.ejs`);
    const templateContent = await fs.readFile(templatePath, 'utf8');
    return ejs.render(templateContent, {
        ...data,
        root: path.join(__dirname, '../../views'),
        appName: process.env.APP_NAME,
        logoUrl: logoUrl,
        supportEmail: process.env.EMAIL_FROM_ADDRESS
    });
}

async function sendMail({
    to,
    subject,
    template,
    templateData = {},
    attachments = []
}) {
    try {
        const html = await renderTemplate(template, {
            ...templateData,
            subject
        });

        const text = htmlToText.compile(html);

        return await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to,
            subject,
            html,
            text,
            attachments
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send email');
    }
}

module.exports = sendMail;