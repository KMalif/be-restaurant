const nodeMailer = require("nodemailer");

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: "khafidulmualif2019@gmail.com",
    pass: "yjka rmxv flmu ttap",
  },
});

const sendForgotPasswordEmail = (to, resetToken) => {
  const mailOptions = {
    from: "khafidulmualif@gmail.com",
    to,
    subject: "Reset Password",
    text: `Your New Passsword: http://localhost:5173/reset-password/${resetToken}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
};

module.exports = sendForgotPasswordEmail;
