import { ProfileService } from "../services/profileServices.js";

export class ProfileController {
    constructor() {
        this.profileService = new ProfileService();
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const user = await this.profileService.getUser(userId);
            if (!user) {
                return res.status(401).json({ success: false, message: "User not found or session invalid" });
            }
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error("Get profile error:", error);
            if (error.message === "User not found") {
                return res.status(401).json({ success: false, message: "User not found" });
            }
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const { username, gender } = req.body;
            const user = await this.profileService.editUser(
                userId,
                { username, gender }
            );
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error("Update profile error:", error);
            if (error.message === "User not found") {
                return res.status(401).json({ success: false, message: "User not found" });
            }
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async address(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const addressData = req.body;
            const address = await this.profileService.createAddress(userId, addressData);
            return res.status(201).json({
                success: true,
                data: address
            });
        } catch (error) {
            console.error("Address creation error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getAddresses(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const addresses = await this.profileService.getAddresses(userId);
            return res.status(200).json({
                success: true,
                data: addresses
            });
        } catch (error) {
            console.error("Fetch addresses error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async setDefaultAddress(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const addressId = req.params.id;
            const updatedAddress = await this.profileService.setDefaultAddress(userId, addressId);
            return res.status(200).json({
                success: true,
                data: updatedAddress,
                message: "Default address updated successfully"
            });
        } catch (error) {
            console.error("Set default address error:", error);
            const status = error.message.includes("not found") ? 404 : 500;
            return res.status(status).json({ success: false, message: error.message || "Internal server error" });
        }
    }

    async deleteAddress(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const addressId = req.params.id;
            const result = await this.profileService.deleteAddress(userId, addressId);
            if (result.count === 0) {
                return res.status(404).json({ success: false, message: "Address not found or not authorized" });
            }
            return res.status(200).json({
                success: true,
                message: "Address deleted successfully"
            });
        } catch (error) {
            console.error("Delete address error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async updateAddress(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const addressId = req.params.id;
            const addressData = req.body;
            const updatedAddress = await this.profileService.updateAddress(userId, addressId, addressData);
            return res.status(200).json({
                success: true,
                data: updatedAddress
            });
        } catch (error) {
            console.error("Update address error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // Alias for backward compatibility
    updateAdress(req, res) {
        return this.updateAddress(req, res);
    }
}
