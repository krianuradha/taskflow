import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILGEN_SMTP_HOST,
    port: Number(process.env.MAILGEN_SMTP_PORT) || 587,
    auth: {
      user: process.env.MAILGEN_SMTP_USER,
      pass: process.env.MAILGEN_SMTP_PASS,
    },
  });   // CREATE A TRANSPORTER OBJECT USING THE SMTP CONFIGURATION FROM THE ENVIRONMENT VARIABLES. THIS OBJECT WILL BE USED TO SEND EMAILS.

  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "TaskFlow",
      link: "https://taskflow.com",
    },
  });   // CREATE A MAILGEN INSTANCE WITH A DEFAULT THEME AND PRODUCT INFORMATION. THIS INSTANCE WILL BE USED TO GENERATE THE EMAIL CONTENT.

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHTML = mailGenerator.generate(options.mailgenContent);

  const message = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: emailTextual,
    html: emailHTML,
  };
// CREATE A MESSAGE OBJECT WITH THE SENDER, RECIPIENT, SUBJECT, AND BOTH PLAINTEXT AND HTML VERSIONS OF THE EMAIL CONTENT.
  try
  {await transporter.sendMail(message);}
    catch(error){
        console.error("Error sending email,make sure you have provided email credentials in .env file:", error);
        throw new Error("Failed to send email");
    }
};// TRY TO SEND THE EMAIL USING THE TRANSPORTER. IF THERE IS AN ERROR, LOG IT TO THE CONSOLE AND THROW A NEW ERROR INDICATING THAT THE EMAIL failed to send.

const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to TaskFlow! We're excited to have you on board.",
      action: {
        instructions: "To verify your email address, please click the button below:",
        button: {
          color: "#22BC66",
          text: "Verify Email",
          link: verificationUrl,
        },
      },
      outro:
        "If you did not create an account, no further action is required. If you have any questions, feel free to reply to this email. We're here to help!",
    },
  };
};// A function that generates the content for the email verification email using Mailgen. It takes the username and verification URL as parameters and returns an object that Mailgen can use to generate the email content.

function forgotPasswordMailgenContent(username, passwordResetUrl) {
  return {
    body: {
      name: username,
      intro:
        "Hello! We received a request to reset your password. If you made this request, please click the button below to reset your password.",
      action: {
        instructions: "To reset your password, please click the button below:",
        button: {
          color: "#71d9ff",
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro:
        "If you did not request a password reset, no further action is required. If you have any questions, feel free to reply to this email. We're here to help!",
    },
  };
}
// A function that generates the content for the forgot password email using Mailgen. It takes the username and password reset URL as parameters and returns an object that Mailgen can use to generate the email content.
export { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent };
