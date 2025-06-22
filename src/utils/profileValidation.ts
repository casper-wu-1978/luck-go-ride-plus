
import { UserProfile } from "@/types/profile";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class ProfileValidation {
  static validateProfile(profile: UserProfile): ValidationResult {
    if (!profile.name.trim()) {
      return {
        isValid: false,
        error: "姓名不能為空"
      };
    }

    return {
      isValid: true
    };
  }
}
