const User = require("../models/User");
const Profile = require("../models/Profile")

exports.getAllUsers = async(req,res)=>{
  try{

    //getting all user data from db 
    const userData = await User.find();

    if(!userData){
      return res.status(401).json({
        success: false,
        message: "Cannot find all user Data"
      })
    }

    return res.status(200).json({
      success: true,
      message: "All Users Data",
      data: userData
    })

  }catch(error){
    console.log("ERROR WHILE GETTING ALL USER DATA", error.message)
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

exports.deleteAccountByAdmin = async (req, res) => {
	try {
		// TODO: Find More on Job Schedule
		// const job = schedule.scheduleJob("10 * * * * *", function () {
		// 	console.log("The answer to life, the universe, and everything!");
		// });
		// console.log(job);
		// console.log("Printing ID: ", req.user.id);
		const {userId} = req.body;
		
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}
		// Delete Assosiated Profile with the User
		await Profile.findByIdAndDelete({ _id: user.additionalDetails });
		// TODO: Unenroll User From All the Enrolled Courses
		// Now Delete User
		await User.findByIdAndDelete(userId);
		res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		console.log(error);
		res
			.status(500)
			.json({ success: false, message: "User Cannot be deleted successfully" });
	}
};