const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const {paymentSuccessEmail} = require("../mail/templates/paymentSuccessEmail")

const { default: mongoose } = require("mongoose");
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress");

// * For mutiple at a time and without webHook
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;

  //Check if course contain something
  if (courses.length === 0) {
    return res.json({
      success: false,
      message: "Please Provide CourseId",
    });
  }

  let totalAmount = 0;

  // going to every course/Traversing
  for (const course_id of courses) {
    let course;
    try {
      course = await Course.findById(course_id);
      // Chekcing if course exist or not
      if (!course) {
        return res.json({
          success: false,
          message: "Could not find the course",
        });
      }

      //setting amount of course
      totalAmount = course.price;

      // validation if user have already have that course or not

      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res.json({
          success: false,
          message: "Student is alreay Enrolled",
        });
      }
    } catch (error) {
      console.log("Error while capturePayment in going to every course", error);
      return res.json({
        success: false,
        message: error.message,
      });
    }
  }

  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };

  try {
    const paymentResponse = await instance.orders.create(options);
    res.status(200).json({
      success: true,
      message: paymentResponse,
    });
  } catch (error) {
    console.log("Error while capturePayment", error);
    return res.status(500).json({
      success: false,
      message: "Error while capturePayment" + error.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  //get data from req
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const courses = req.body?.courses;
  const userId = req.user.id;

  //Validation
  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(401).json({
      success: false,
      message: "Payment failed because all fields are required",
    });
  }

  //Verification
  let body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  // If verfication happens
  if (expectedSignature === razorpay_signature) {
    //Enrolled studen in course
    enrollStudents(courses, userId, res);

    //return res
    return res.status(200).json({
      success: true,
      message: "Payment Verfied",
    });
  }
};

//Enrolling studen
const enrollStudents = async (courses, userId, res) => {
  //validation
  if (!courses || !userId) {
    return res.status(401).json({
      success: false,
      message:
        "Failed while enrolledStudent in vergying payemnt all fields are required",
    });
  }

  //*Add Student in course in Enrooled Students
  //Traverse on evry course
  for (const courseId of courses) {
    //find the courses
    try {
      const enrolledCourse = await Course.findByIdAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );
      if (!enrolledCourse) {
        return res.status(401).json({
          success: false,
          message: "Course Not Found",
        });
      }

        //progress of a course
        const courseProgress = await CourseProgress.create({
          courseID: courseId,
          userId,
          completedVideos:[],
        })

      //Add CourseId in Student Courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress:courseProgress._id,
          },
        },
        { new: true }
      );

      if (!enrolledStudent) {
        return res.status(401).json({
          success: false,
          message: "User Not Found",
        });
      }

    

      // Sending Mail to user
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent successfully: ", emailResponse.response)

    } catch (error) {
      console.log(
        "Error while enrolling studen in course and vice versa",
        error
      );
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

//sending mail after payment sucessfull
exports.sendPaymentSuccessEmail = async (req, res) => {
  //fecth data
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id; 

  //Validation
  if (!orderId || !paymentId || !amount || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the details(Send Email)",
    });
  }

  try {
    //Find User
    const enrolledStudent = await User.findById(userId);

    //send Mail
    await mailSender(
      enrolledStudent.email,
      `Payment Recieved`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail of payment successfull", error)
    return res.status(500).json({
        success:false,
        message:"Could Not send Mail"
    })
  }
};

//*For single Order
//*capture the payment and initiate the Razorpay order
// exports.capturePayment = async (req, res) => {
//     //get courseId and UserID
//     const {course_id} = req.body;
//     const userId = req.user.id;
//     //validation
//     //valid courseID
//     if(!course_id) {
//         return res.json({
//             success:false,
//             message:'Please provide valid course ID',
//         })
//     };
//     //valid courseDetail
//     let course;
//     try{
//         course = await Course.findById(course_id);
//         if(!course) {
//             return res.json({
//                 success:false,
//                 message:'Could not find the course',
//             });
//         }

//         //user already pay for the same course
//         const uid = new mongoose.Types.ObjectId(userId);
//         if(course.studentsEnrolled.includes(uid)) {
//             return res.status(200).json({
//                 success:false,
//                 message:'Student is already enrolled',
//             });
//         }
//     }
//     catch(error) {
//         console.error(error);
//         return res.status(500).json({
//             success:false,
//             message:error.message,
//         });
//     }

//     //order create
//     const amount = course.price;
//     const currency = "INR";

//     const options = {
//         amount: amount * 100,
//         currency,
//         receipt: Math.random(Date.now()).toString(),
//         notes:{
//             courseId: course_id,
//             userId,
//         }
//     };

//     try{
//         //initiate the payment using razorpay
//         const paymentResponse = await instance.orders.create(options);
//         console.log(paymentResponse);
//         //return response
//         return res.status(200).json({
//             success:true,
//             courseName:course.courseName,
//             courseDescription:course.courseDescription,
//             thumbnail: course.thumbnail,
//             orderId: paymentResponse.id,
//             currency:paymentResponse.currency,
//             amount:paymentResponse.amount,
//         });
//     }
//     catch(error) {
//         console.log(error);
//         res.json({
//             success:false,
//             message:"Could not initiate order",
//         });
//     }

// };

//*verify Signature of Razorpay and Server
// exports.verifySignature = async (req, res) => {
//     const webhookSecret = "12345678";

//     const signature = req.headers["x-razorpay-signature"];

//     const shasum =  crypto.createHmac("sha256", webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if(signature === digest) {
//         console.log("Payment is Authorised");

//         const {courseId, userId} = req.body.payload.payment.entity.notes;

//         try{
//                 //fulfil the action

//                 //find the course and enroll the student in it
//                 const enrolledCourse = await Course.findOneAndUpdate(
//                                                 {_id: courseId},
//                                                 {$push:{studentsEnrolled: userId}},
//                                                 {new:true},
//                 );

//                 if(!enrolledCourse) {
//                     return res.status(500).json({
//                         success:false,
//                         message:'Course not Found',
//                     });
//                 }

//                 console.log(enrolledCourse);

//                 //find the student andadd the course to their list enrolled courses me
//                 const enrolledStudent = await User.findOneAndUpdate(
//                                                 {_id:userId},
//                                                 {$push:{courses:courseId}},
//                                                 {new:true},
//                 );

//                 console.log(enrolledStudent);

//                 //mail send krdo confirmation wala
//                 const emailResponse = await mailSender(
//                                         enrolledStudent.email,
//                                         "Congratulations from CodeHelp",
//                                         "Congratulations, you are onboarded into new CodeHelp Course",
//                 );

//                 console.log(emailResponse);
//                 return res.status(200).json({
//                     success:true,
//                     message:"Signature Verified and COurse Added",
//                 });

//         }
//         catch(error) {
//             console.log(error);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message,
//             });
//         }
//     }
//     else {
//         return res.status(400).json({
//             success:false,
//             message:'Invalid request',
//         });
//     }

// };
