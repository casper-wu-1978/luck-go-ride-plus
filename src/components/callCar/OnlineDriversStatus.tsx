
import { Button } from "@/components/ui/button";

interface OnlineDriversStatusProps {
  onlineDriversCount: number;
  onRefresh: () => void;
}

const OnlineDriversStatus = ({ onlineDriversCount, onRefresh }: OnlineDriversStatusProps) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${onlineDriversCount > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            線上司機: {onlineDriversCount} 位
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          重新整理
        </button>
      </div>
    </div>
  );
};

export default OnlineDriversStatus;
