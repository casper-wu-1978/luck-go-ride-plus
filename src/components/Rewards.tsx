
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Gift, Coins, Star, TrendingUp } from "lucide-react";

const Rewards = () => {
  const currentPoints = 1250;
  const nextRewardAt = 2000;
  const progress = (currentPoints / nextRewardAt) * 100;

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

      {/* Progress to Next Reward */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-emerald-700">
            <Star className="h-5 w-5 mr-2" />
            獎勵進度
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>距離下一個獎勵</span>
              <span>{nextRewardAt - currentPoints} 點</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          <p className="text-sm text-gray-600">
            再獲得 {nextRewardAt - currentPoints} 點即可解鎖免費乘車券
          </p>
        </CardContent>
      </Card>

      {/* Reward Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-emerald-700">
            <Gift className="h-5 w-5 mr-2" />
            獎勵等級
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div>
                <p className="font-medium text-emerald-700">銅級會員</p>
                <p className="text-sm text-gray-600">0 - 1,000 點</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">已達成</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div>
                <p className="font-medium text-amber-700">銀級會員</p>
                <p className="text-sm text-gray-600">1,001 - 2,000 點</p>
              </div>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">進行中</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-700">金級會員</p>
                <p className="text-sm text-gray-600">2,001+ 點</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">未解鎖</span>
            </div>
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
