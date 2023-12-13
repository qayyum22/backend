const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");


//* Update course
exports.updateCourseProgress = async(req, res)=>{
  try{

    //fetch data
    const {courseId, subSectionId} = req.body;

    const userId = req.user.id;

    //validation
    if(!courseId || !subSectionId || !userId){
      return res.status(401).json({
        success:false,
        message: "All fileds are required"
      })
    }

    //check if subsection is present or not
    const subsection = await SubSection.findById(subSectionId);

    if(!subsection){
      return res.status(404).json({
        error: "Invalid SUBSECTION"
      })
    }

    //check for old entry
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    if(!courseProgress){
      return res.status(401).json({
        success:false,
        message: "Course Progress doenot exist"
      })
    }else{
      //check for re-completing video/subsection
      if(courseProgress.completedVideos.includes(subSectionId)){
        return res.status(401).json({
          success:false,
          message: "Subsection already completed"
        })
      }
      //push into completed video
      courseProgress.completedVideos.push(subSectionId);
    }

    //saving into db
    await courseProgress.save();

    return res.status(200).json({
      success:true,
      message: "Course updated"
    })


  }catch(error){
    console.log("ERROR WHILE UPDATING COURSE PROGRESS",error.message);
    return res.status(500).json({
      success:false,
      message: "Internal Server Error"
    })
  }
}