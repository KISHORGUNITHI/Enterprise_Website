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

  async editUser(id, username) {
    const userData = await this.userRepository.updateUser(id, { username });
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
}
