import { UserRepository } from "../repositories/userRepository.js";

export class ProfileService {
  constructor() {
    this.userRepository = new UserRepository();
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
}