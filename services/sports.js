import Sport from "../models/Sports.js";

export const createSport = async (req) => {
  const { sportsTypesId } = req.params;
  const sports = {
    sportsType: sportsTypesId,
    ...req.body,
  };
  try {
    const newSport = await Sport.create(sports);

    return {
      message: "Sport created successfully",
      sport: newSport,
    };
  } catch (error) {
    throw error;
  }
};

export const updateSport = async (req) => {
  try {
    const sport = await Sport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!sport) {
      return { message: "Sport not found" };
    }

    return {
      message: "Sport updated successfully",
      sport,
    };
  } catch (error) {
    throw error;
  }
};

export const removeSport = async (req) => {
  try {
    const sport = await Sport.findByIdAndDelete(req.params.id);

    if (!sport) {
      return { message: "Sport not found" };
    }

    return {
      message: "Sport deleted successfully",
    };
  } catch (error) {
    throw error;
  }
};

export const getSportById = async (req) => {
  const { id } = req.params;

  try {
    const sport = await Sport.findById(id).populate("sportsType");

    if (!sport) {
      return { message: "Sport not found" };
    }

    return sport;
  } catch (error) {
    throw error;
  }
};

export const getAllSports = async (req) => {
  const {
    page,
    limit,
    sortBy = "createdAt",
    sortOrder = "asc",
    ...rawFilters
  } = req.query;

  const { sportsTypesId } = req.params;

  // Add sportsType filter from param
  const filters = { sportsType: sportsTypesId };

  // Add case-insensitive partial match filters from query
  Object.keys(rawFilters).forEach((key) => {
    if (typeof rawFilters[key] === "string") {
      filters[key] = { $regex: rawFilters[key], $options: "i" };
    }
  });

  const sortOption = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  try {
    if (page && limit) {
      const skip = (page - 1) * limit;

      const data = await Sport.find(filters)
        .populate("sportsType")
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit));

      const total = await Sport.countDocuments(filters);

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

    const data = await Sport.find(filters)
      .populate("sportsType")
      .sort(sortOption);
    return { data };
  } catch (error) {
    throw error;
  }
};
