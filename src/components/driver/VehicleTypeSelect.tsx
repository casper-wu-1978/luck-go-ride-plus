
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { VEHICLE_TYPES } from "@/constants/callCar";

interface VehicleTypeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const VehicleTypeSelect = ({ 
  value, 
  onValueChange, 
  label = "車輛類型",
  placeholder = "請選擇車輛類型",
  className 
}: VehicleTypeSelectProps) => {
  return (
    <div className={className}>
      <Label className="text-sm font-medium text-gray-700 mb-2 block">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {VEHICLE_TYPES.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VehicleTypeSelect;
