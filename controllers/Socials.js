const Social = require("../models/Social");
const User = require("../models/User");

// Function to create a new course
exports.createSocial = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id;
    const { platform, link } = req.body;

   
    // Check if any of the required fields are missing
    if (!platform || !link) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      });
    }

   
    //created a object of social
    const newSocialLink = await Social.create({
      name: platform,
      link,
      user:userId,
    });


    console.log("Clearrr")


    const userDetails = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          socials: newSocialLink._id,
        },
      },
      { new: true }
    ).populate(["additionalDetails","socials"]);

    
    res.status(200).json({
      success: true,
      message: `${platform} Link created Successfully`,
      data:userDetails
    });

  } catch (error) {
    // Handle any errors that occur during the creation of the course
    console.error("error while creating social link", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Social Link",
      error: error.message,
    });
  }
};


exports.updateSocial = async (req, res) => {
	try {
		const { socialId, link } = req.body;
		const id = req.user.id;
    console.log(link);
		const social = await Social.findById(socialId);

		// Update the profile fields
		social.link = link || social.link;

		// Save the updated profile
		await social.save();
		const updatedUserDetails = await User.findById(id).populate(["additionalDetails","socials"]);

		return res.json({
			success: true,
			message: "Socials updated successfully",
			data:updatedUserDetails,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.deleteSocial = async (req, res) => {
	try {
		const id = req.user.id;
    const {socialId} = req.body;
		
		// const user = await User.findByIdAndUpdate(id);
		// if (!user) {
		// 	return res.status(404).json({
		// 		success: false,
		// 		message: "User not found",
		// 	});
		// }
		// Delete Assosiated Profile with the User
    const userDetails = await User.findByIdAndUpdate(id,
      {
        $pull:{socials:socialId}
      },
      {new:true}).populate(["additionalDetails","socials"])
      
		await Social.findByIdAndDelete({ _id: socialId });
		

   

      return res.status(200).json({
        success: true,
        message: "User Social deleted successfully",
        data: userDetails
      });

	} catch (error) {
		console.log(error);
		res
			.status(500)
			.json({ success: false, message: "User Social Cannot be deleted successfully" });
	}
};