
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Hash } from "lucide-react";
import { CAR_TYPES, FAVORITE_TYPES } from "@/constants/callCar";
import { FavoriteCode, FavoriteAddress } from "@/types/callCar";

interface CallFormProps {
  carType: string;
  setCarType: (value: string) => void;
  favoriteType: string;
  setFavoriteType: (value: string) => void;
  selectedCode: string;
  setSelectedCode: (value: string) => void;
  selectedAddressName: string;
  setSelectedAddressName: (value: string) => void;
  selectedAddress: string;
  setSelectedAddress: (value: string) => void;
  favoriteCodes: FavoriteCode[];
  favoriteAddresses: FavoriteAddress[];
  isLoading: boolean;
  callRecordsCount: number;
  onCallCar: () => void;
}

const CallForm = ({
  carType,
  setCarType,
  favoriteType,
  setFavoriteType,
  selectedCode,
  setSelectedCode,
  selectedAddressName,
  setSelectedAddressName,
  selectedAddress,
  setSelectedAddress,
  favoriteCodes,
  favoriteAddresses,
  isLoading,
  callRecordsCount,
  onCallCar
}: CallFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-emerald-700">
          <Car className="h-6 w-6 mr-2" />
          +1 叫車
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Car Type Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            車型選擇
          </Label>
          <RadioGroup value={carType} onValueChange={setCarType} className="flex flex-row space-x-4">
            {CAR_TYPES.map((type) => (
              <div key={type.id} className="flex items-center space-x-1">
                <RadioGroupItem value={type.id} id={type.id} />
                <Label htmlFor={type.id} className="text-sm cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Favorite Type Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            常用選擇
          </Label>
          <RadioGroup value={favoriteType} onValueChange={setFavoriteType} className="flex flex-row space-x-4">
            {FAVORITE_TYPES.map((type) => (
              <div key={type.id} className="flex items-center space-x-1">
                <RadioGroupItem value={type.id} id={type.id} />
                <Label htmlFor={type.id} className="text-sm cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Code Selection */}
        {favoriteType === "code" && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              <Hash className="h-4 w-4 inline mr-1" />
              代碼
            </Label>
            <Select value={selectedCode} onValueChange={setSelectedCode}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="請選擇代碼" />
              </SelectTrigger>
              <SelectContent>
                {favoriteCodes.map((code) => (
                  <SelectItem key={code.id} value={code.id}>
                    {code.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Address Selection */}
        {favoriteType === "address" && (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                選擇地址
              </Label>
              <Select 
                value={selectedAddressName} 
                onValueChange={(value) => {
                  setSelectedAddressName(value);
                  const address = favoriteAddresses.find(addr => addr.name === value);
                  setSelectedAddress(address?.address || "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="請選擇地址" />
                </SelectTrigger>
                <SelectContent>
                  {favoriteAddresses.map((address) => (
                    <SelectItem key={address.id} value={address.name}>
                      {address.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAddress && (
              <div>
                <Label htmlFor="selectedAddress" className="text-sm font-medium text-gray-700 mb-1 block">
                  住址
                </Label>
                <Input
                  id="selectedAddress"
                  value={selectedAddress}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            )}
          </div>
        )}

        {/* Call Button */}
        <Button 
          onClick={onCallCar} 
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-xl font-medium"
          disabled={isLoading || callRecordsCount >= 10}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              叫車中...
            </div>
          ) : (
            `+1 叫車 (${callRecordsCount}/10)`
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CallForm;
