
import { DriverProfile } from "@/types/profile";

export interface DriverValidationResult {
  isValid: boolean;
  error?: string;
}

export class DriverProfileValidation {
  static validateProfile(profile: DriverProfile): DriverValidationResult {
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
