import { UserRepository } from "../repositories/userRepository.js";
import { AddressRepository } from "../repositories/addressRepository.js";

export class ProfileService {
  constructor() {
    this.userRepository = new UserRepository();
    this.addressRepository = new AddressRepository();
  }

  async getUser(id) {
    const userData = await this.userRepository.findById(id);
    if (!userData) {
      throw new Error("User not found");
    }
    const { password_hash, ...safeUser } = userData;
    return safeUser;
  }

  async editUser(id, dataOrUsername) {
    const updateData = {};

    if (typeof dataOrUsername === 'string') {
      updateData.username = dataOrUsername.trim();
    } else if (dataOrUsername && typeof dataOrUsername === 'object') {
      const { username, gender } = dataOrUsername;
      if (typeof username === 'string' && username.trim().length >= 2) {
        updateData.username = username.trim();
      }
      if (gender) {
        const normalized = String(gender).toUpperCase().trim();
        const validGenders = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];
        if (validGenders.includes(normalized)) {
          updateData.gender = normalized;
        }
      }
    }

    const userData = await this.userRepository.updateUser(id, updateData);
    if (!userData) {
      throw new Error("User not found");
    }
    const { password_hash, ...safeUser } = userData;
    return safeUser;
  }
  
  async createAddress(userId, addressData) {
      return await this.addressRepository.createAddress(userId, addressData);
  }

  async getAddresses(userId) {
      return await this.addressRepository.getAddresses(userId);
  }

  async setDefaultAddress(userId, addressId) {
      return await this.addressRepository.setDefaultAddress(userId, addressId);
  }

  async deleteAddress(userId, addressId) {
      return await this.addressRepository.deleteAddress(userId, addressId);
  }

  async updateAddress(userId, addressId, addressData) {
      return await this.addressRepository.updateAddress(userId, addressId, addressData);
  }
}
