const express = require("express")
const router = express.Router()
const { auth, isAdmin, isInstructor } = require("../middlewares/auth")
const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
} = require("../controllers/Profile")
const { instructorProfile } = require("../controllers/User")

const {getAllUsers, deleteAccountByAdmin} = require("../controllers/Admin");
const { createSocial, updateSocial, deleteSocial } = require("../controllers/Socials")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delet User Account
router.delete("/deleteProfile", auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.post("/userProfile", instructorProfile)
// Instructor dashboard
router.get("/instructorDashboard",auth,isInstructor, instructorDashboard)

// ********************************************************************************************************
//                                      Admin routes
// ********************************************************************************************************
//*Admin getting all user data
router.get("/allUserData",auth, isAdmin, getAllUsers)
router.delete("/deleteAccountByAdmin",auth, isAdmin, deleteAccountByAdmin)

// ********************************************************************************************************
//                                      Social instructor routes
// ********************************************************************************************************
router.post("/createSocial", auth, isInstructor, createSocial);
router.put("/updateSocial", auth , isInstructor, updateSocial);
router.post("/deleteSocial", auth, isInstructor, deleteSocial);




module.exports = router