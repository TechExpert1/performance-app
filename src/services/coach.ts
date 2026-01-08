import { Request } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { SortOrder } from "mongoose";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/user.js";
// import { sendPushNotification } from "../config/firebase.js";
import Notification from "../models/Notification.js";
import Gym from "../models/Gym.js";
export const createCoach = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return { message: "Gym owner information is missing from request." };
    }
    const data = {
      ...req.body,
      profileImage: (req as any).fileUrls?.profile?.[0] || "",
      createdBy: req.user.id, // Set the creator
    };
    // Only consider email-password accounts when checking for duplicates
    const existingUser = await User.findOne({ email: req.body.email, authProvider: "email" });
    if (existingUser) {
      return { message: "User with this email already exists" };
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    data.password = hashedPassword;
    // Ensure role and authProvider are set correctly for coach
    data.role = data.role || "coach";
    data.authProvider = "email";
    const coach = await User.create(data);
    return coach;
  } catch (error) {
    console.error("Error in createCoach:", error);
    throw error;
  }
};

// Update a Coach
export const updateCoach = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("Gym owner information is missing from request.");
    }

    const { id } = req.params; // Coach ID to update
    const updateData: any = {
      ...req.body,
    };

    // If profile image was uploaded
    if ((req as any).fileUrls?.profile) {
      updateData.profileImage = (req as any).fileUrls.profile[0];
    }

    // If password is being updated, hash it
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      updateData.password = hashedPassword;
    }

    const updatedCoach = await User.findOneAndUpdate(
      { _id: id }, // ensure gym owner can only update their own coach
      updateData,
      { new: true }
    );

    if (!updatedCoach) {
      throw new Error("Coach not found or you're not authorized to update.");
    }

    return updatedCoach;
  } catch (error) {
    console.error("Error in updateCoach:", error);
    throw error;
  }
};
// Delete a Coach
export const removeCoach = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("Gym owner authentication missing");
    }

    const { id } = req.params;

    // Find the coach first to verify ownership
    const coach = await User.findById(id);
    
    if (!coach) {
      throw new Error("Coach not found");
    }

    if (coach.role !== 'coach') {
      throw new Error("This user is not a coach");
    }

    // SuperAdmin can delete any coach
    if (req.user.role === 'superAdmin') {
      await User.findByIdAndDelete(id);
      return { message: "Coach removed successfully" };
    }

    // For gym owners and other roles, check if they created this coach or own the gym
    const ownedGyms = await Gym.find({ owner: req.user.id }).select('_id').lean();
    const gymIds = ownedGyms.map((gym: any) => gym._id.toString());
    
    const isOwner = coach.createdBy?.toString() === req.user.id || 
                    (coach.gym && gymIds.includes(coach.gym.toString()));

    if (!isOwner) {
      throw new Error("You're not authorized to delete this coach");
    }

    await User.findByIdAndDelete(id);

    return { message: "Coach removed successfully" };
  } catch (error) {
    console.error("Error in removeCoach:", error);
    throw error;
  }
};

// Get Coach by ID
export const getCoachById = async (req: Request) => {
  try {
    const coach = await User.findById(req.params.id).populate("createdBy");
    if (!coach) throw new Error("Coach not found");

    return coach;
  } catch (error) {
    console.error("Error in getCoachById:", error);
    throw error;
  }
};

export const getAllMembers = async (req: Request) => {
  try {
    const coachId = req.params.id;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      User.find({ coach: coachId })
        .select('name email profileImage phoneNumber role gym coach createdAt updatedAt')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments({ coach: coachId }),
    ]);

    // Convert to plain objects and ensure profileImage is always present
    const membersData = members.map(member => {
      const obj = member.toObject();
      return {
        ...obj,
        profileImage: obj.profileImage || null
      };
    });

    return {
      members: membersData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error in getAllMembers:", error);
    throw error;
  }
};
export const handleAssignMember = async (req: Request) => {
  try {
    if (req.user?.role === "coach")
      throw new Error(
        "Not authorized, only gym owner can perform this operation"
      );
    const coach = await User.findById(req.params.id);
    if (!coach) throw new Error("Coach not found");
    const user = await User.findById(req.body.userId);
    if (!user) throw new Error("User not found");
    if (user?.coach) {
      throw new Error("User has already assigined with a coach");
    } else {
      user.coach = new mongoose.Types.ObjectId(req.params.id);
      await user.save();
    }
    await Notification.create({
      user: coach._id,
      message: `${user.name} has been assigned to you for coaching.`,
      entityType: "assing_member_to_coach",
      entityId: user._id,
      isRead: false,
    });

    // Push notification
    // if (coach.deviceToken) {
    //   await sendPushNotification(
    //     coach.deviceToken,
    //     "New member assigned",
    //     `${user.name} has been assigned to you for coaching.`,
    //     String(user._id),
    //     "assing_member_to_coach"
    //   );
    // }
    return user;
  } catch (error) {
    console.error("Error in getCoachById:", error);
    throw error;
  }
};

export const getAllCoachs = async (req: Request) => {
  try {
    const {
      page,
      limit,
      sortBy = "createdAt",
      sortOrder = "desc",
      ...filters
    } = req.query as Record<string, string>;

    const query: Record<string, any> = {
      role: "coach",
    };

    // Apply dynamic filters if any
    for (const key in filters) {
      if (filters[key]) {
        query[key] = filters[key];
      }
    }

    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    let coaches, total;

    // If pagination is requested
    if (page || limit) {
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      [coaches, total] = await Promise.all([
        User.find(query).sort(sortOptions).skip(skip).limit(limitNum),
        User.countDocuments(query),
      ]);

      return {
        data: coaches,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          totalResults: total,
        },
      };
    } else {
      // Return all coaches without pagination
      coaches = await User.find(query).sort(sortOptions);

      return {
        data: coaches,
        pagination: null, // optional
      };
    }
  } catch (error) {
    console.error("Error in getAllCoachs:", error);
    throw error;
  }
};

export const getGymMembersWithCoachAssignment = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("Authentication required");
    }

    const { coachId } = req.query;
    const {
      page,
      limit,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    if (!coachId || typeof coachId !== 'string') {
      throw new Error("coachId query parameter is required");
    }

    // Find all gyms owned by or associated with the authenticated user
    let gymIds: string[] = [];
    
    if (req.user.role === 'gymOwner') {
      const ownedGyms = await Gym.find({ owner: req.user.id }).select('_id').lean();
      gymIds = ownedGyms.map((gym: any) => gym._id.toString());
    } else if (req.user.role === 'coach') {
      // If the user is a coach, get their associated gym
      const coach = await User.findById(req.user.id).select('gym');
      if (coach?.gym) {
        gymIds = [coach.gym.toString()];
      }
    } else if (req.user.role === 'superAdmin' || req.user.role === 'salesRep') {
      // Admin can see all gyms
      const allGyms = await Gym.find().select('_id').lean();
      gymIds = allGyms.map((gym: any) => gym._id.toString());
    }

    if (gymIds.length === 0) {
      return {
        data: [],
        pagination: null,
      };
    }

    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Get all gym members (athletes) from the gyms
    const gymMemberRecords = await mongoose.model('Gym_Member').find({
      gym: { $in: gymIds },
      role: 'athlete',
      status: 'active'
    }).select('user gym').lean();

    const userIds = gymMemberRecords.map((record: any) => record.user);

    let members, total;

    // If pagination is requested
    if (page || limit) {
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      [members, total] = await Promise.all([
        User.find({ _id: { $in: userIds } })
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .select('name email profileImage phoneNumber role gym coach')
          .lean(),
        User.countDocuments({ _id: { $in: userIds } }),
      ]);
    } else {
      members = await User.find({ _id: { $in: userIds } })
        .sort(sortOptions)
        .select('name email profileImage phoneNumber role gym coach')
        .lean();
      total = members.length;
    }

    // Add assignedTo flag based on whether the member has any coach assigned
    const membersWithAssignment = members.map((member: any) => ({
      ...member,
      assignedTo: !!member.coach // true if member has any coach assigned
    }));

    if (page || limit) {
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;

      return {
        data: membersWithAssignment,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          totalResults: total,
        },
      };
    } else {
      return {
        data: membersWithAssignment,
        pagination: null,
      };
    }
  } catch (error) {
    console.error("Error in getGymMembersWithCoachAssignment:", error);
    throw error;
  }
};

export const getMyCoaches = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("Gym owner authentication required");
    }

    // Find all gyms owned by this gym owner
    const ownedGyms = await Gym.find({ owner: req.user.id }).select('_id');
    const gymIds = ownedGyms.map(gym => gym._id);

    if (gymIds.length === 0) {
      return {
        data: [],
        pagination: null,
      };
    }

    const {
      page,
      limit,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Find coaches that are associated with the gym owner's gyms
    // Coaches can be linked via User.gym field or Gym_Member records
    const query = {
      role: "coach",
      $or: [
        { gym: { $in: gymIds } }, // Direct gym reference on User
        { _id: { $in: await mongoose.model('Gym_Member').find({ 
          gym: { $in: gymIds }, 
          role: "coach",
          status: "active" 
        }).distinct('user') } } // Via Gym_Member
      ]
    };

    let coaches, total;

    // If pagination is requested
    if (page || limit) {
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      [coaches, total] = await Promise.all([
        User.find(query).sort(sortOptions).skip(skip).limit(limitNum),
        User.countDocuments(query),
      ]);

      return {
        data: coaches,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          totalResults: total,
        },
      };
    } else {
      // Return all coaches without pagination
      coaches = await User.find(query).sort(sortOptions);

      return {
        data: coaches,
        pagination: null,
      };
    }
  } catch (error) {
    console.error("Error in getMyCoaches:", error);
    throw error;
  }
};

// Get gym athletes for authenticated gym owner
export const getGymAthletes = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    // Get gym owner's gym
    const gymOwner = await User.findById(req.user.id).select("gym");
    if (!gymOwner || !gymOwner.gym) {
      return {
        message: "Gym not found for this gym owner",
        gymMembers: [],
      };
    }

    const GymMember = (await import("../models/Gym_Member.js")).default;

    // Fetch only active athletes from this gym
    const gymMembers = await GymMember.find({
      gym: gymOwner.gym,
      status: "active",
    })
      .select("user")
      .populate({
        path: "user",
        select: "name email profileImage role",
        match: { role: "athlete" }, // Filter to only athletes
      })
      .lean();

    // Filter out null users (non-athletes will be null due to populate match)
    const athletesOnly = gymMembers.filter((member) => member.user !== null);

    return {
      gymMembers: athletesOnly,
    };
  } catch (error) {
    console.error("Error in getGymAthletes:", error);
    throw error;
  }
};

// Get sport reviews for a gym member athlete (filtered by sport, month, year)
export const getAthleteSportReviews = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { athleteId } = req.params;
    const { sport, month, year } = req.query as Record<string, string>;

    // Verify gym owner has access to this athlete
    const gymOwner = await User.findById(req.user.id).select("gym");
    if (!gymOwner || !gymOwner.gym) {
      throw new Error("Gym not found for this gym owner");
    }

    const GymMember = (await import("../models/Gym_Member.js")).default;
    const athleteMember = await GymMember.findOne({
      user: athleteId,
      gym: gymOwner.gym,
      status: "active",
    });

    if (!athleteMember) {
      throw new Error("Athlete not found in your gym");
    }

    // Build query
    const query: any = { user: athleteId };

    if (sport) {
      query.sport = sport;
    }

    // Filter by month and year if provided
    if (month && year) {
      const monthMap: Record<string, number> = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
      };
      const monthIndex = monthMap[month.toLowerCase()];
      const numericYear = Number(year);

      if (monthIndex !== undefined && !isNaN(numericYear)) {
        const startDate = new Date(numericYear, monthIndex, 1);
        const endDate = new Date(numericYear, monthIndex + 1, 0, 23, 59, 59);
        query.createdAt = { $gte: startDate, $lte: endDate };
      }
    }

    const Review = (await import("../models/Review.js")).default;
    const reviews = await Review.find(query)
      .populate("sport")
      .populate("coachFeedback.coach", "name email profileImage")
      .populate("peerFeedback.friend", "name email profileImage")
      .sort({ createdAt: 1 })
      .lean();

    // Group reviews by date and calculate daily averages
    const reviewsByDate: Record<string, any> = {};

    reviews.forEach((review) => {
      const reviewDate = review.createdAt ? new Date(review.createdAt) : new Date();
      const date = reviewDate.toISOString().split("T")[0];
      
      if (!reviewsByDate[date]) {
        reviewsByDate[date] = {
          date,
          personalReviews: [],
          peerReviews: [],
          coachReviews: [],
        };
      }

      // Personal review (athlete's self-rating)
      if (review.rating) {
        reviewsByDate[date].personalReviews.push({
          rating: review.rating > 10 ? review.rating / 2 : review.rating / 2, // Convert 1-10 to 1-5 scale
          comment: review.comment,
        });
      }

      // Peer review
      if (review.peerFeedback?.rating) {
        reviewsByDate[date].peerReviews.push({
          rating: review.peerFeedback.rating > 10 ? review.peerFeedback.rating / 2 : review.peerFeedback.rating / 2,
          comment: review.peerFeedback.comment,
          friend: review.peerFeedback.friend,
        });
      }

      // Coach review
      if (review.coachFeedback?.rating) {
        reviewsByDate[date].coachReviews.push({
          rating: review.coachFeedback.rating > 10 ? review.coachFeedback.rating / 2 : review.coachFeedback.rating / 2,
          comment: review.coachFeedback.comment,
          coach: review.coachFeedback.coach,
        });
      }
    });

    // Calculate daily averages
    const dailyReviews = Object.values(reviewsByDate).map((day: any) => {
      const personalAvg = day.personalReviews.length > 0
        ? day.personalReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / day.personalReviews.length
        : 0;

      const peerAvg = day.peerReviews.length > 0
        ? day.peerReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / day.peerReviews.length
        : 0;

      const coachAvg = day.coachReviews.length > 0
        ? day.coachReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / day.coachReviews.length
        : 0;

      return {
        date: day.date,
        personalReview: parseFloat(personalAvg.toFixed(1)),
        peerReview: parseFloat(peerAvg.toFixed(1)),
        coachReview: parseFloat(coachAvg.toFixed(1)),
      };
    });

    return {
      message: "Sport reviews fetched successfully",
      data: dailyReviews,
    };
  } catch (error) {
    console.error("Error in getAthleteSportReviews:", error);
    throw error;
  }
};

// Get skill training data for a gym member athlete (filtered by time period and sport)
export const getAthleteSkillTraining = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { athleteId } = req.params;
    const { sport, timePeriod, startDate, endDate } = req.query as Record<string, string>;

    // Verify gym owner has access to this athlete
    const gymOwner = await User.findById(req.user.id).select("gym");
    if (!gymOwner || !gymOwner.gym) {
      throw new Error("Gym not found for this gym owner");
    }

    const GymMember = (await import("../models/Gym_Member.js")).default;
    const athleteMember = await GymMember.findOne({
      user: athleteId,
      gym: gymOwner.gym,
      status: "active",
    });

    if (!athleteMember) {
      throw new Error("Athlete not found in your gym");
    }

    // Calculate date range based on timePeriod
    let queryStartDate: Date;
    let queryEndDate: Date = new Date();

    if (startDate && endDate) {
      queryStartDate = new Date(startDate);
      queryEndDate = new Date(endDate);
    } else if (timePeriod) {
      const days = parseInt(timePeriod);
      queryStartDate = new Date();
      queryStartDate.setDate(queryStartDate.getDate() - days);
    } else {
      // Default to 7 days
      queryStartDate = new Date();
      queryStartDate.setDate(queryStartDate.getDate() - 7);
    }

    // Query Training_Member to find trainings the athlete attended
    const Training_Member = (await import("../models/Training_Member.js")).default;
    const TrainingCalendar = (await import("../models/Training_Calendar.js")).default;

    const trainingMembers = await Training_Member.find({
      user: athleteId,
      status: { $ne: "rejected" }, // Include approved and pending, exclude rejected
    }).select("training");

    console.log("Training members found:", trainingMembers.length);

    const trainingIds = trainingMembers.map((tm) => tm.training);

    console.log("Training IDs:", trainingIds.length);

    // Get trainings with skill data
    const trainings = await TrainingCalendar.find({
      _id: { $in: trainingIds },
      date: { $gte: queryStartDate, $lte: queryEndDate },
      ...(sport && { sport }),
    })
      .populate("skill", "name")
      .populate("skills", "name")
      .populate("sport", "name")
      .lean();

    console.log("Trainings found:", trainings.length);

    // Count skill occurrences
    const skillCounts: Record<string, { name: string; count: number }> = {};

    trainings.forEach((training) => {
      // Handle single skill
      if (training.skill && typeof training.skill === "object" && "name" in training.skill) {
        const skillName = (training.skill as any).name;
        if (!skillCounts[skillName]) {
          skillCounts[skillName] = { name: skillName, count: 0 };
        }
        skillCounts[skillName].count++;
      }

      // Handle multiple skills
      if (Array.isArray(training.skills)) {
        training.skills.forEach((skill: any) => {
          if (skill && typeof skill === "object" && "name" in skill) {
            const skillName = skill.name;
            if (!skillCounts[skillName]) {
              skillCounts[skillName] = { name: skillName, count: 0 };
            }
            skillCounts[skillName].count++;
          }
        });
      }
    });

    console.log("Skill counts:", skillCounts);

    // Calculate percentages
    const totalCount = Object.values(skillCounts).reduce((sum, skill) => sum + skill.count, 0);
    const skillPercentages = Object.values(skillCounts).map((skill) => ({
      skill: skill.name,
      percentage: totalCount > 0 ? parseFloat(((skill.count / totalCount) * 100).toFixed(1)) : 0,
      count: skill.count,
    }));

    return {
      message: "Skill training data fetched successfully",
      data: {
        timePeriod: timePeriod || "7",
        startDate: queryStartDate.toISOString(),
        endDate: queryEndDate.toISOString(),
        skills: skillPercentages,
      },
    };
  } catch (error) {
    console.error("Error in getAthleteSkillTraining:", error);
    throw error;
  }
};

// Get physical performance data for a gym member athlete (for graphs 3 & 4)
export const getAthletePhysicalPerformance = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { athleteId } = req.params;
    const { month, year, exercise } = req.query as Record<string, string>;

    // Verify gym owner has access to this athlete
    const gymOwner = await User.findById(req.user.id).select("gym");
    if (!gymOwner || !gymOwner.gym) {
      throw new Error("Gym not found for this gym owner");
    }

    const GymMember = (await import("../models/Gym_Member.js")).default;
    const athleteMember = await GymMember.findOne({
      user: athleteId,
      gym: gymOwner.gym,
      status: "active",
    });

    if (!athleteMember) {
      throw new Error("Athlete not found in your gym");
    }

    // Build date query
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (month && year) {
      const monthMap: Record<string, number> = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
      };
      const monthIndex = monthMap[month.toLowerCase()];
      const numericYear = Number(year);

      if (monthIndex !== undefined && !isNaN(numericYear)) {
        startDate = new Date(numericYear, monthIndex, 1);
        endDate = new Date(numericYear, monthIndex + 1, 0, 23, 59, 59);
      }
    }

    const PhysicalPerformance = (await import("../models/Physical_Performance.js")).default;
    const PerformanceSet = (await import("../models/Physical_Performance_Set.js")).default;

    // Get performances
    const performanceQuery: any = { user: athleteId };
    if (startDate && endDate) {
      performanceQuery.date = { $gte: startDate, $lte: endDate };
    }

    const performances = await PhysicalPerformance.find(performanceQuery).lean();
    const performanceIds = performances.map((p) => p._id);

    // Get performance sets
    const setQuery: any = { performance: { $in: performanceIds } };
    if (exercise) {
      setQuery.exercise = exercise;
    }

    const performanceSets = await PerformanceSet.find(setQuery)
      .populate("exercise", "name distance time")
      .populate("category", "name")
      .populate("subCategory", "name")
      .lean();

    // Group by exercise and date for graphing
    const exerciseData: Record<string, any[]> = {};

    performanceSets.forEach((set) => {
      const performance = performances.find((p) => p._id.toString() === set.performance?.toString());
      if (!performance) return;

      const exerciseName = (set.exercise as any)?.name || "Unknown";
      const date = new Date(performance.date).toISOString().split("T")[0];

      if (!exerciseData[exerciseName]) {
        exerciseData[exerciseName] = [];
      }

      // Calculate max weight or best performance from variations
      set.variation.forEach((v: any) => {
        exerciseData[exerciseName].push({
          date,
          weight: v.weight || 0,
          reps: v.reps || 0,
          sets: v.sets || 0,
          duration: v.duration || 0,
          distance: v.distance || 0,
          rpe: v.rpe || 0,
        });
      });
    });

    // For attendance tracking (graph 4)
    const Training_Member = (await import("../models/Training_Member.js")).default;
    
    const attendanceQuery: any = { user: athleteId, status: "approved" };
    
    const trainingMembers = await Training_Member.find(attendanceQuery)
      .populate({
        path: "training",
        select: "date",
        ...(startDate && endDate && {
          match: { date: { $gte: startDate, $lte: endDate } }
        })
      })
      .lean();

    const attendedDates = trainingMembers
      .filter((tm) => tm.training)
      .map((tm: any) => new Date(tm.training.date).toISOString().split("T")[0]);

    const attendanceCount = attendedDates.length;

    return {
      message: "Physical performance data fetched successfully",
      data: {
        exercises: exerciseData,
        attendance: {
          daysAttended: attendanceCount,
          dates: attendedDates,
        },
      },
    };
  } catch (error) {
    console.error("Error in getAthletePhysicalPerformance:", error);
    throw error;
  }
};
