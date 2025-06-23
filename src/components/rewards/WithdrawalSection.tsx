
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Loader2 } from "lucide-react";

interface WithdrawalSectionProps {
  availableForWithdrawal: number;
  isProcessingWithdrawal: boolean;
  onWithdrawalRequest: () => void;
}

const WithdrawalSection = ({ 
  availableForWithdrawal, 
  isProcessingWithdrawal, 
  onWithdrawalRequest 
}: WithdrawalSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-green-700">
          <DollarSign className="h-5 w-5 mr-2" />
          提領申請
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-700 font-medium">可提領金額</span>
            <span className="text-2xl font-bold text-green-800">NT$ {availableForWithdrawal}</span>
          </div>
          <p className="text-green-600 text-sm mb-4">
            回饋金每月月初可申請提領，不能抵扣車費
          </p>
          <Button 
            onClick={onWithdrawalRequest}
            disabled={availableForWithdrawal <= 0 || isProcessingWithdrawal}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isProcessingWithdrawal ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                處理中...
              </>
            ) : (
              '申請提領'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSection;
