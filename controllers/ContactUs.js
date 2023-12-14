const Contact = require("../models/ContactUs");
const  mailSender  = require("../utils/mailSender");
const {contactusResponsetemplate} = require("../mail/templates/contactusResponsetemplate")

//creating contact handler
exports.contact = async (req, res) => {
  try {
    //getting data from req.body
    const {countrycode,email, firstName, lastName, message, phoneNo } =
      req.body;

    //validate
    if (!firstName || !email || !phoneNo || !message) {
      return res.status(400).json({
        success: false,
        message: "All fileds are needed",
      });
    }
    const processedLastName = lastName ? lastName : "";
  
    //saving data in db
    const contactDetails = await Contact.create({
      firstName: firstName,
      lastName: processedLastName,
      email: email,
      phoneNumber: `${countrycode}-${phoneNo}`,
      message: message,
    });

    if (!contactDetails) {
      return res.status(400).json({
        success: false,
        message: "contact details are not found",
      });
    }

    const mailSendToUser = await mailSender(
      contactDetails.email,
      "Successfull",
      contactusResponsetemplate(contactDetails)
    );

    if(!mailSendToUser){
      return res.status(400).json({
        success: false,
        message: "Mail to user is not send Successfully",
      });
    }

    const mailSendToMe = await mailSender(
      `qayyum123786@gmail.com`,
      "You got a Response!!",
      contactusResponsetemplate(contactDetails)
    );

    //return respones
    res.status(200).json({
      success: true,
      message: "Conatct me Details create successfully",
      data: contactDetails,
    });
  } catch (error) {
    console.log("Error in conatcus handler", error.message)
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
};

exports.testing = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Backend is working fine",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
