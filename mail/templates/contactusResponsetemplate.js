exports.contactusResponsetemplate = (doc) => {
    const { firstName, lastName, email, phoneNumber, message } = doc;
    return `<!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="UTF-8">
      <title>Password Update Confirmation</title>
      <style>
          body {
              background-color: #ffffff;
              font-family: Arial, sans-serif;
              font-size: 16px;
              line-height: 1.4;
              color: #333333;
              margin: 0;
              padding: 0;
          }
  
  
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              text-align: center;
          }
  
          .logo {
              max-width: 200px;
              margin-bottom: 20px;
          }
  
          .message {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
          }
  
          .body {
              font-size: 16px;
              margin-bottom: 20px;
          }
  
          .support {
              font-size: 14px;
              color: #999999;
              margin-top: 20px;
          }
  
          .info_container{
            border: 1px solid #61636a;
            border-radius: 20px;
            max-width: 400px;
            margin: 0 auto;
            padding: 10px;
            text-align: center;
        }
        
        .inside_cont{
            display: flex;
            gap: 0.2rem;
            justify-content: center;
            align-items: center;
        }

      </style>
  
  </head>
  
  <body>
      <div class="container">
      <a href="https://imgbb.com/"><img src="https://i.ibb.co/qDcwfW0/Untitled-design-2.png" alt="Untitled-design-2" border="0"></a>
          <div class="message">Contact Form Confirmation</div>
          <div class="body">
              <h3>Dear ${firstName} ${lastName},</h3>
              <p>Thank you for contacting us. We have received your message and will respond to you as soon as possible.</p>
              <p>Here are the details you provided</p>
          </div>
          <div class="info_container">
              <div class="inside_cont">
                  <h4>First Name: ${firstName}</h4>
              </div>

              <div class="inside_cont">
                  <h4>Last Name: ${lastName}</h4>
              </div>

              <div class="inside_cont">
                  <h4>Email Address: ${email}</h4>
              </div>

              <div class="inside_cont">
                  <h4>Phone Number: ${phoneNumber}</h4>
              </div>

              <div class="inside_cont">
                  <h4>Message: ${message}</h4>
              </div>
          </div>
          <p>We appreciate your interest and will get back to you shortly.</p>
          <div class="support">If you have any questions or need further assistance, please feel free to reach out to us
              at
          <a href="mailto:information.sblab@gmail.com">information.sblab@gmail.com</a>. We are here to help!
          </div>
      </div>
  </body>
  
  </html>`;
};
