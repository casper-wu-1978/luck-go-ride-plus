
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Calendar } from "lucide-react";

interface RewardStats {
  totalRewards: number;
  thisMonthRewards: number;
  availableForWithdrawal: number;
  completedOrders: number;
}

interface RewardStatsProps {
  stats: RewardStats;
}

const RewardStats = ({ stats }: RewardStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0">
        <CardContent className="p-4 text-center">
          <Coins className="h-8 w-8 mx-auto mb-2 opacity-90" />
          <p className="text-2xl font-bold">NT$ {stats.totalRewards}</p>
          <p className="text-sm opacity-90">累計回饋金</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-0">
        <CardContent className="p-4 text-center">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-90" />
          <p className="text-2xl font-bold">NT$ {stats.thisMonthRewards}</p>
          <p className="text-sm opacity-90">本月回饋</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardStats;
