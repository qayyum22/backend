const Course = require("../models/Course");
const User = require("../models/User");
const { convertSecondsToDuration } = require("../utils/secToDuration");

exports.getAllCourses = async (req, res) => {
  try {
    const coursesDetails = await Course.find(
      {},
      {
        courseName: true,
        thumbnail: true,
      }
    )
      .sort({ createdAt: -1 })
      .populate("instructor")
      .exec();

    if (!coursesDetails) {
      return res.status(401).json({
        success: false,
        message: "Courses Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Courses Sent Successfully",
      data: coursesDetails,
    });
  } catch (error) {
    console.log("Error While getting search courses", error);
    return res.status(404).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//For search Drop Down
exports.querySearch = async (req, res) => {
  try {
    const { searchQuery } = req.params;
    // console.log(searchQuery);

    if (!searchQuery) {
      return res.status(401).json({
        success: false,
        message: "No Search query Found",
      });
    }

    // const searchTerms = searchQuery.split(" ").join("|");---> for $text search
    // const regexPattern = new RegExp(searchTerms, "i");
    const queryTitle = new RegExp(searchQuery, "i");

    if (!queryTitle) {
      return res.status(401).json({
        success: false,
        message: "Query Title not found",
      });
    }

    //one more way (courseName: {$regex:searchQuery, $options: 'i'}

    // const coursesDetails = await Course.find(
    //   {
    //     $or: [

    //       { courseName: regexPattern },
    //       { courseDescription: queryTitle },
    //     ],
    //   },
    //   {
    //     courseName: true,
    //     thumbnail: true,
    //   }
    // )
    //   .sort({ createdAt: -1 })
    //   .populate("instructor")
    //   .exec();

    //! MongoDb search
    // console.log(searchQuery)
    const coursesDetails = await Course.aggregate([
      {
        $search: {
          index: "courseName-Search",
          text: {
            query: searchQuery,
            path: "courseName",
          },
        },
      },
      {
        $limit: 4,
      },
      {
        $project: {
          courseName: true,
          thumbnail: true,
          instructor: true,
        },
      },
    ]);

    const populatedCourses = await Promise.all(
      coursesDetails.map(async (course) => {
        const instructorId = course.instructor;
        const instructorData = await User.findById(instructorId);
        return {
          ...course,
          instructor: [instructorData.firstName, instructorData.lastName],
        };
      })
    );

    // console.log("Populte Courses", populatedCourses);

    if (!populatedCourses) {
      return res.status(401).json({
        success: false,
        message: "Courses Not Found",
      });
    }

    const instructorDetails = await User.find(
      {
        $and: [
          {
            $or: [{ firstName: queryTitle }, { lastName: queryTitle }],
          },
          { accountType: "Instructor" },
        ],
      },
      {
        firstName: true,
        lastName: true,
        image: true,
      }
    ).sort({ createdAt: -1 });

    if (!instructorDetails) {
      return res.status(401).json({
        success: false,
        message: "Instructor Deatils Not Found",
      });
    }

    const autoComplete = await Course.aggregate([
      {
        $search: {
          index: "courseName-Search",
          autocomplete: {
            query: searchQuery,
            path: "courseName",
            tokenOrder: "sequential",
          },
        },
      },
      {
        $limit: 4,
      },
      {
        $project: {
          _id: 0,
          courseName: 1,
        },
      },
    ]);

    const autoCompleteTags = await Course.aggregate([
      {
        $search: {
          index: "courseName-Search",
          autocomplete: {
            query: searchQuery,
            path: "tag",
            tokenOrder: "sequential",
          },
        },
      },
      {
        $limit: 4,
      },
      {
        $project: {
          _id: 0,
          tag: 1,
        },
      },
    ]);

    let allAutoCompleteTags = []
    autoCompleteTags.forEach((item)=>(
      item.tag.forEach((tagItem)=>(
        allAutoCompleteTags = [...allAutoCompleteTags, tagItem]
      ))
    ))
    // console.log(autoComplete);

    return res.status(200).json({
      success: true,
      message: "Courses Sent Successfully",
      data: { populatedCourses, instructorDetails, autoComplete,allAutoCompleteTags },
    });
  } catch (error) {
    console.log("Error While getting search courses", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//For search Page
exports.SearchpPage = async (req, res) => {
  try {
    const { searchQuery } = req.params;
    // console.log(searchQuery);

    if (!searchQuery) {
      return res.status(401).json({
        success: false,
        message: "No Search query Found",
      });
    }

    //! MongoDb search
    const coursesDetails = await Course.aggregate([
      {
        $search: {
          index: "search-query",
          text: {
            query: searchQuery,
            path: {
              wildcard: "*",
            },
            fuzzy:{}
          },
        },
      },
    ]);

    const FullCourseDetails = await Promise.all(
      coursesDetails.map(async (course) => {
        const courseDetails = await Course.findById(course._id)
          .populate("instructor")
          .populate("category")
          .populate("ratingAndReviews")
          .populate({
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          })
          .exec();

        let totalDurationInSeconds = 0;
        courseDetails.courseContent.forEach((content) => {
          content.subSection.forEach((subSection) => {
            const timeDurationInSeconds = parseInt(subSection.timeDuration);
            totalDurationInSeconds += timeDurationInSeconds;
          });
        });

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

        let totalLecture = 0;
        courseDetails.courseContent.forEach((section) => {
          console.log(section.sectionName, section.subSection.length);
          totalLecture += section.subSection.length;
        });

        return {
          data: [courseDetails, totalDuration, totalLecture],
        };
      })
    );

    // console.log("Populte Courses",populatedCourses)

    if (!FullCourseDetails) {
      return res.status(401).json({
        success: false,
        message: "Courses Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Courses Sent Successfully",
      data: FullCourseDetails,
    });
  } catch (error) {
    console.log("Error While getting search courses", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
