const User = require("../models/User");

exports.instructorProfile = async (req, res) => {
  try{

    //get data from request
    const {instructorId} = req.body

    //Validating
    if(!instructorId){
      return res.status(401).json({
        success: false,
        message: "Did not recieve id",
      });
    }

    const InstructorDetails = await User.findById(instructorId).populate("additionalDetails")
    .populate({
      path: "courses",
      match: { status: "Published" },
      populate: [{
        path:"ratingAndReviews",
        populate:{
          path:"user"
        }
      }, "category"]
    })
    .exec()

    if(!InstructorDetails){
      return res.status(401).json({
        success: false,
        message: "Cannot find Instructor Data",
      });
    }

    return res.status(200).json({
      success: true,
      data: InstructorDetails,
    });



  }catch(error){
    console.log("error in returning Instruvtor data", error)
    return res.status(500).json({
      success: false,
      message: "Cannot send Instructor Data",
    });
  }
}