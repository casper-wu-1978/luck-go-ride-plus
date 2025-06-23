
import { Loader2 } from "lucide-react";
import { useRewards } from "@/hooks/useRewards";
import RewardStats from "@/components/rewards/RewardStats";
import WithdrawalSection from "@/components/rewards/WithdrawalSection";
import RewardExplanation from "@/components/rewards/RewardExplanation";
import RewardHistoryList from "@/components/rewards/RewardHistoryList";

const Rewards = () => {
  const {
    stats,
    rewardHistory,
    isLoading,
    isProcessingWithdrawal,
    handleWithdrawalRequest
  } = useRewards();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-green-800">載入回饋資料中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-800 mb-2">回饋金管理</h2>
        <p className="text-green-600">每筆完成訂單可獲得車資2%回饋</p>
      </div>

      <RewardStats stats={stats} />

      <WithdrawalSection 
        availableForWithdrawal={stats.availableForWithdrawal}
        isProcessingWithdrawal={isProcessingWithdrawal}
        onWithdrawalRequest={handleWithdrawalRequest}
      />

      <RewardExplanation />

      <RewardHistoryList rewardHistory={rewardHistory} />
    </div>
  );
};

export default Rewards;
