import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {}
};

const registerUser = asyncHandler(async (req, res) => {
  /*
    get user details
    validatation of received data
    check if user already exist
    upload avatar & coverImage
    check for avatar upload or not
    save data to db
    send response but extract to password & refresh token
    check for user cration 
    send response
    */

  const { userName, email, fullName, password } = req.body;

  //   validatation of received data
  if (
    [userName, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //   check if user already exist
  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with this Email or Username is already exist, Please try with another Email or Username"
    );
  }

  // upload avatar & coverImage
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //     check for avatar upload or not
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  //   save data to db
  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // send response but extract to password & refresh token
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //   return res
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /*
  get data by req.body
  validate the data
  check data exist or not
  if user exist then check the password
  generate refresh token and access token
  send cookie
  */

  const { email, userName, password } = req.body;

  // validation of recieved data
  if ((!email || !userName) && !password) {
    throw new ApiError(400, "Email or Username is required");
  }

  // check user exist or not
  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!existedUser) {
    throw new ApiError(404, "User not exist,Please register first");
  }

  const isValidPassword = await existedUser.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Inavlid user credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(existedUser._id);

  const loggedInUser = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        accessToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  console.log(req.cookie.refreshToken);
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Invalid Refresh token");
  }
  try {
    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodeToken?._id);

    if (!user) {
      throw new ApiError(401, "Unauthorized error");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token expired or used");
    }

    const { refreshToken, accessToken } = await generateTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            refreshToken,
            accessToken,
          },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log(req.user._id);
  const user = await User.findById(req.user?._id);

  console.log(user);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old Password is Incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changes Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: user,
      },
      "User fetched sucessfully"
    )
  );
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { userName, fullName, email } = req.body;

  if (!userName || !fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        userName,
        fullName,
        email: email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res.status(200).json(
    new ApiResponse(
      201,
      {
        user: user,
      },
      "User updated successfully"
    )
  );
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLoaclFilePath = req.file?.path;

  if (!avatarLoaclFilePath) {
    throw new ApiError(400, "avatar not found");
  }

  const avatar = await uploadOnCloudinary(avatarLoaclFilePath);

  if (!avatar?.url) {
    throw new ApiError(401, "Error on file uplaoding");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res.status(200).json(200, user, "Avatar updated successfully");
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageFilePath = req.file?.path;

  if (!coverImage) {
    throw new ApiError(400, "Cover image is missing");
  }
  const coverImage = await uploadOnCloudinary(coverImageFilePath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error on file uploading");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res.status(200).json(200, user, "Cover Image updated successfully");
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;

  if (!userName.trim()) {
    throw new ApiError(400, "Username not found");
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribed",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        subscribedChannelCount: {
          $size: "$subscribed",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        userName: 1,
        fullName: 1,
        subscriberCount: 1,
        subscribedChannelCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(400, "Channel doesn't exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel fetched Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeUserPassword,
  getCurrentUser,
  updateUserProfile,
  updateCoverImage,
  updateAvatar,
  getUserChannelProfile,
};
