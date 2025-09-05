import userModel from "../models/userModels.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.userId; // from middleware
    const user = await userModel.findById(userId);
    if(!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      userData: {
        _id: user._id, // ensure _id is present for frontend
        name: user.name,
        email: user.email,
        emailVerified: user.isVerified,
        createdAt: user.createdAt // optional
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export const updateUserData = async (req, res) => {
  try {
    const {userId, name} = req.body;
    const user = await userModel.findById(userId);
    if(!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.name = name;
    await user.save();
    res.json({
      success: true,
      message: "User data updated successfully",
      userData: {
        name: user.name,
        isAccountVerified: user.isVerified,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
} 

export const deleteUserAccount = async (req, res) => {
  try {
    const {userId} = req.body;
    const user = await userModel.findById(userId);
    if(!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    await userModel.findByIdAndDelete(userId);
    res.json({
      success: true,
      message: "User account deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}