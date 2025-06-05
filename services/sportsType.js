import SportsType from "../models/Sports_Type.js";

export const createSportsType = async (req) => {
  const { name } = req.body;

  try {
    const existing = await SportsType.findOne({ name });
    if (existing) {
      return { message: "SportsType with this name already exists" };
    }

    const newSportsType = await SportsType.create(req.body);

    return {
      message: "SportsType created successfully",
      sportsType: newSportsType,
    };
  } catch (error) {
    throw error;
  }
};

export const updateSportsType = async (req) => {
  try {
    const sportsType = await SportsType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!sportsType) {
      return { message: "SportsType not found" };
    }

    return {
      message: "SportsType updated successfully",
      sportsType,
    };
  } catch (error) {
    throw error;
  }
};

export const removeSportsType = async (req) => {
  try {
    const sportsType = await SportsType.findByIdAndDelete(req.params.id);
    if (!sportsType) {
      return { message: "SportsType not found" };
    }

    return {
      message: "SportsType deleted successfully",
    };
  } catch (error) {
    throw error;
  }
};

export const getSportsTypeById = async (req) => {
  const { id } = req.params;

  try {
    const sportsType = await SportsType.findById(id);
    if (!sportsType) {
      return { message: "SportsType not found" };
    }

    return sportsType;
  } catch (error) {
    throw error;
  }
};

// export const getAllSportsTypes = async () => {
//   try {
//     const sportsTypes = await SportsType.find();
//     return sportsTypes;
//   } catch (error) {
//     throw error;
//   }
// };

export const getAllSportsTypes = async (req) => {
  const {
    page,
    limit,
    sortBy = "createdAt",
    sortOrder = "asc",
    ...rawFilters
  } = req.query;

  // Clone filters safely before modifying
  const filters = {};

  Object.keys(rawFilters).forEach((key) => {
    if (typeof rawFilters[key] === "string") {
      filters[key] = { $regex: rawFilters[key], $options: "i" };
    }
  });

  const sortOption = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  try {
    if (page && limit) {
      const skip = (page - 1) * limit;
      console.log(filters);
      const data = await SportsType.find(filters)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit));

      const total = await SportsType.countDocuments(filters);

      return {
        data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
          totalResults: total,
        },
      };
    }
    console.log(filters);
    const data = await SportsType.find(filters).sort(sortOption);
    return { data };
  } catch (error) {
    throw error;
  }
};
