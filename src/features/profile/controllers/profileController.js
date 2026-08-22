import { ProfileService } from "../services/profileServices.js";

export class ProfileController {
  constructor() {
    this.profileService = new ProfileService();
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.id || req.user.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      const user = await this.profileService.getUser(userId);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(error.message === "User not found" ? 404 : 500).json({
        success: false,
        message: error.message || "Failed to fetch profile",
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id || req.user.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      const { username } = req.body;
      if (!username || typeof username !== 'string' || username.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Username must be at least 2 characters long",
        });
      }
      const user = await this.profileService.editUser(userId, username.trim());
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      return res.status(error.message === "User not found" ? 404 : 500).json({
        success: false,
        message: error.message || "Failed to update profile",
      });
    }
  }
}