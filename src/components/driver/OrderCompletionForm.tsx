
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation, DollarSign } from "lucide-react";

interface OrderCompletionFormProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    orderId: string;
    destinationAddress: string;
    distanceKm: number;
    fareAmount: number;
  }) => void;
}

const OrderCompletionForm = ({ orderId, isOpen, onClose, onSubmit }: OrderCompletionFormProps) => {
  const [destinationAddress, setDestinationAddress] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [fareAmount, setFareAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destinationAddress.trim() || !distanceKm || !fareAmount) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        orderId,
        destinationAddress: destinationAddress.trim(),
        distanceKm: parseFloat(distanceKm),
        fareAmount: parseFloat(fareAmount)
      });
      
      // Reset form
      setDestinationAddress("");
      setDistanceKm("");
      setFareAmount("");
      onClose();
    } catch (error) {
      console.error('完成訂單表單提交錯誤:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDestinationAddress("");
      setDistanceKm("");
      setFareAmount("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-800">
            <Navigation className="h-5 w-5 mr-2" />
            完成訂單
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center text-sm font-medium">
              <MapPin className="h-4 w-4 mr-1" />
              目的地地址
            </Label>
            <Textarea
              id="destination"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder="請輸入目的地地址"
              required
              disabled={isSubmitting}
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distance" className="flex items-center text-sm font-medium">
                <Navigation className="h-4 w-4 mr-1" />
                行駛公里數
              </Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                min="0"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="0.0"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fare" className="flex items-center text-sm font-medium">
                <DollarSign className="h-4 w-4 mr-1" />
                車資費用
              </Label>
              <Input
                id="fare"
                type="number"
                step="1"
                min="0"
                value={fareAmount}
                onChange={(e) => setFareAmount(e.target.value)}
                placeholder="0"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !destinationAddress.trim() || !distanceKm || !fareAmount}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "提交中..." : "完成訂單"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCompletionForm;
