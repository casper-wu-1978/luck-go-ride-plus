
import { UserProfile } from "@/types/callCar";

export const CAR_TYPES = [
  { id: "unlimited", label: "不限" },
  { id: "taxi", label: "小黃" },
  { id: "diverse", label: "多元" },
  { id: "private", label: "白牌" },
  { id: "driver", label: "代駕" },
];

export const FAVORITE_TYPES = [
  { id: "none", label: "無選擇" },
  { id: "code", label: "代碼" },
  { id: "address", label: "住址" },
];

export const USER_PROFILE: UserProfile = {
  name: "林小姐",
  phone: "0912-345-678",
  businessName: "林記小吃店",
  businessAddress: "台北市大安區忠孝東路四段123號"
};

export const MAX_CALL_RECORDS = 10;
