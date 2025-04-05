import nodemailer from "nodemailer";
// import ejs from "ejs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

class Email {
  constructor(user, data, email) {
    this.to = email ? email : user.email;
    this.firstName = user.fullName.firstName;
    this.data = data;
    this.from = process.env.EMAIL_FROM;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else if (process.env.NODE_ENV === "development") {
      return nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 465,
        secure: false,
        auth: {
          user: process.env.MAILTRAP_USERNAME,
          pass: process.env.MAILTRAP_PASSWORD,
        },
      });
    }
  }

  async send(template, subject) {
    // const html = await ejs.renderFile(
    //   join(__dirname, `../views/${template}.ejs`),
    //   {
    //     firstName: this.firstName,
    //     url: this.url,
    //     subject,
    //   }
    // );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: this.data?.toString(),
      html: `<p>Your code is: ${this.data?.toString()}</p>`,
      // html,
      // text: convert(html, {
      //   wordwrap: 130,
      // }),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to Exotoura!");
  }
  async sendVerify() {
    await this.send("verify", "Verify your account (valid for only 10 minutes)");
  }
  async sendNotifyPasswordChange() {
    await this.send("notifyPasswordChange", "Your password has changed!");
  }
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset code (valid for only 10 minutes)"
    );
  }
}

export default Email;
