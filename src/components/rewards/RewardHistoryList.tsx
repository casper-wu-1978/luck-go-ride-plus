
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface RewardHistory {
  id: string;
  date: string;
  orderAmount: number;
  rewardAmount: number;
  description: string;
}

interface RewardHistoryListProps {
  rewardHistory: RewardHistory[];
}

const RewardHistoryList = ({ rewardHistory }: RewardHistoryListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-green-700">
          <TrendingUp className="h-5 w-5 mr-2" />
          最近回饋紀錄
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rewardHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>尚無回饋紀錄</p>
            <p className="text-sm mt-2">完成訂單後會顯示回饋明細</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewardHistory.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{reward.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>{reward.date}</span>
                    <span>訂單金額: NT$ {reward.orderAmount}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-medium text-lg">+NT$ {reward.rewardAmount}</span>
                  <p className="text-xs text-gray-500">2% 回饋</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardHistoryList;
