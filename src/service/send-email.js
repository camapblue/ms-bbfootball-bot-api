const mailer = require('nodemailer');

const transporter = mailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "rachel.cheng.bb@gmail.com",
    pass: "Bupbe0208!"
  }
});

const checkMailer = () => {
  return new Promise((resolve) => {
    transporter.verify(function(error, success) {
      if (error) {
        console.log('MAILER NOT READY =', error);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  })
}

const sendError = async (request, errorMessage) => {
  const verify = await checkMailer();
  if (!verify) { return; }

  const { path, payload } = request;

  var message = {
    from: 'not-reply@85neighbors.com',
    to: 'liubei.bbfootball@gmail.com',
    subject: `[BBF API][Error] ${path}`,
    html: `
      <p>Created date: ${new Date()}</p>
      <p>Payload: ${JSON.stringify(payload)}</p>
      <p>Error message: ${errorMessage}</p>
    `
  };

  await transporter.sendMail(message);
}

module.exports = { 
  sendError
};
