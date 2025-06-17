
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp } from "lucide-react";

const Rewards = () => {
  const currentPoints = 1250;

  const rewardHistory = [
    { date: "2024-06-15", points: 50, description: "完成訂單獎勵" },
    { date: "2024-06-10", points: 100, description: "首次使用獎勵" },
    { date: "2024-06-08", points: 25, description: "推薦好友獎勵" },
  ];

  return (
    <div className="space-y-6">
      {/* Current Points */}
      <Card className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
        <CardContent className="p-6 text-center">
          <Coins className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-2">{currentPoints.toLocaleString()}</h2>
          <p className="opacity-90">可用回饋金</p>
        </CardContent>
      </Card>

      {/* Reward Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-emerald-700">回饋機制</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-emerald-50 p-4 rounded-lg">
            <p className="text-emerald-800 text-sm leading-relaxed">
              商店叫車，每單成單後，平台收取12%，平台會回饋2%給商家
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-emerald-700">
            <TrendingUp className="h-5 w-5 mr-2" />
            最近獲得
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rewardHistory.map((reward, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{reward.description}</p>
                  <p className="text-sm text-gray-500">{reward.date}</p>
                </div>
                <span className="text-emerald-600 font-medium">+{reward.points}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rewards;
