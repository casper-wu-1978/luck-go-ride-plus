
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RewardExplanation = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-700">回饋機制說明</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-green-800 leading-relaxed">
              <strong>回饋計算：</strong>每筆完成的叫車訂單，平台收取司機車資的12%，其中2%回饋給商家
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-800 leading-relaxed">
              <strong>提領規則：</strong>回饋金僅能用於提領，無法抵扣車費。每月月初開放申請提領
            </p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="text-amber-800 leading-relaxed">
              <strong>處理時間：</strong>提領申請送出後，將於3-5個工作天內處理完成
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardExplanation;
