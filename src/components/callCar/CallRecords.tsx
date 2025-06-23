
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, X, User, Phone, Car, Building, MapPin, Hash, CheckCircle, Navigation, Play, Flag } from "lucide-react";
import { CallRecord } from "@/types/callCar";
import { UserProfile } from "@/types/profile";

interface CallRecordsProps {
  callRecords: CallRecord[];
  userProfile: UserProfile;
  onCancelCall: (recordId: string) => void;
}

const CallRecords = ({ callRecords, userProfile, onCancelCall }: CallRecordsProps) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return '等待媒合中...';
      case 'matched': return '司機已接單';
      case 'arrived': return '司機已抵達';
      case 'in_progress': return '行程進行中';
      case 'completed': return '行程已完成';
      case 'failed': return '媒合失敗';
      case 'cancelled': return '已取消';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-600';
      case 'matched': return 'text-blue-600';
      case 'arrived': return 'text-green-600';
      case 'in_progress': return 'text-purple-600';
      case 'completed': return 'text-green-800';
      case 'failed': return 'text-red-600';
      case 'cancelled': return 'text-gray-600';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="h-4 w-4" />;
      case 'matched': return <CheckCircle className="h-4 w-4" />;
      case 'arrived': return <Navigation className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'completed': return <Flag className="h-4 w-4" />;
      case 'failed': return <X className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (callRecords.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-gray-700 text-xl">
          <Clock className="h-6 w-6 mr-2" />
          司機媒合狀態
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {callRecords.map((record) => (
            <div key={record.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-semibold text-gray-800 text-lg">
                    {record.carTypeLabel}
                  </span>
                  <span className="text-base text-gray-600 ml-3">
                    {record.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 text-base font-semibold ${getStatusColor(record.status)}`}>
                    {getStatusIcon(record.status)}
                    <span>{getStatusText(record.status)}</span>
                  </div>
                  {record.status === 'waiting' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCancelCall(record.id)}
                      className="h-7 px-3 text-sm border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    >
                      <X className="h-4 w-4 mr-1" />
                      取消
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Driver Information */}
              {(record.status === 'matched' || record.status === 'arrived' || record.status === 'in_progress' || record.status === 'completed') && record.driverInfo && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-blue-800 font-medium text-sm mb-2">司機資訊</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center text-blue-700">
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-sm ml-1">{record.driverInfo.name}</span>
                      <Phone className="h-4 w-4 ml-4 mr-1" />
                      <span className="text-sm">{record.driverInfo.phone}</span>
                    </div>
                    <div className="flex items-center text-blue-700">
                      <Car className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">車牌：</span>
                      <span className="text-sm ml-1">{record.driverInfo.plateNumber}</span>
                      <span className="text-sm ml-4 font-medium">品牌：</span>
                      <span className="text-sm ml-1">{record.driverInfo.carBrand}</span>
                      <span className="text-sm ml-4 font-medium">顏色：</span>
                      <span className="text-sm ml-1">{record.driverInfo.carColor}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* User Profile Information */}
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center text-green-700">
                    <User className="h-4 w-4 mr-2" />
                    <span className="text-sm">{userProfile.name}</span>
                    {userProfile.phone && (
                      <>
                        <Phone className="h-4 w-4 ml-4 mr-1" />
                        <span className="text-sm">{userProfile.phone}</span>
                      </>
                    )}
                  </div>
                  {record.favoriteType !== "address" && userProfile.business_name && (
                    <>
                      <div className="flex items-center text-green-700">
                        <Building className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">上車點：</span>
                        <span className="text-sm ml-1">{userProfile.business_name}</span>
                      </div>
                      {userProfile.business_address && (
                        <div className="flex items-center text-green-700">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">{userProfile.business_address}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Display favorite choice info */}
              {record.favoriteInfo && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center text-blue-700">
                    {record.favoriteType === "code" ? (
                      <Hash className="h-4 w-4 mr-2" />
                    ) : (
                      <MapPin className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-sm font-medium">
                      {record.favoriteType === "code" ? "代碼" : "地址"}：
                    </span>
                    <span className="text-sm ml-1">{record.favoriteInfo}</span>
                  </div>
                </div>
              )}
              
              {record.status === 'waiting' && (
                <div className="mt-3">
                  <Progress value={undefined} className="w-full h-3" />
                  <div className="text-sm text-gray-600 mt-2">
                    正在為您尋找最適合的司機...
                  </div>
                </div>
              )}

              {record.status === 'matched' && (
                <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-800">
                  司機正在前往您的位置，請耐心等候
                </div>
              )}

              {record.status === 'arrived' && (
                <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
                  司機已抵達，請準備上車！
                </div>
              )}

              {record.status === 'in_progress' && (
                <div className="mt-3 p-2 bg-purple-100 rounded text-sm text-purple-800">
                  行程進行中，請繫好安全帶
                </div>
              )}

              {record.status === 'completed' && (
                <div className="mt-3 p-2 bg-green-200 rounded text-sm text-green-900">
                  行程已完成，感謝您的使用！
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CallRecords;
