
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiff } from "@/contexts/LiffContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Shield, Store } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useLiff();
  const { userRole, isLoading } = useUserRole();

  useEffect(() => {
    // 如果用戶已有角色，直接導向對應頁面
    if (!isLoading && userRole) {
      navigate(`/${userRole}`);
    }
  }, [userRole, isLoading, navigate]);

  // 如果正在載入或已有角色，顯示載入中
  if (isLoading || userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-800 text-lg">載入中...</p>
        </div>
      </div>
    );
  }

  const handleRoleSelect = (role: string) => {
    navigate(`/${role}`);
  };

  const roles = [
    {
      id: 'driver',
      title: '司機端',
      description: '接受叫車訂單，開始賺錢',
      icon: Car,
      color: 'bg-blue-500 hover:bg-blue-600',
      features: ['接受訂單', '導航服務', '收入統計']
    },
    {
      id: 'merchant',
      title: '商家端',
      description: '為客戶叫車，提升服務',
      icon: Store,
      color: 'bg-green-500 hover:bg-green-600',
      features: ['代客叫車', '訂單管理', '客戶服務']
    },
    {
      id: 'admin',
      title: '管理員',
      description: '系統管理與監控',
      icon: Shield,
      color: 'bg-purple-500 hover:bg-purple-600',
      features: ['訂單監控', '司機管理', '數據分析']
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-emerald-800 mb-4">Luck Go</h1>
          <p className="text-xl text-emerald-600 mb-2">您的專屬叫車平台</p>
          {profile && (
            <p className="text-emerald-700">歡迎，{profile.displayName}</p>
          )}
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className={`w-20 h-20 rounded-full ${role.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-gray-800 mb-2">{role.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-lg">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full ${role.color} text-white py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    進入{role.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-12">
          <p className="text-sm text-emerald-600 mb-4">
            選擇身份後可以隨時切換，或聯繫管理員協助
          </p>
          <div className="flex justify-center space-x-4 text-xs text-emerald-500">
            <span>• 安全可靠</span>
            <span>• 快速媒合</span>
            <span>• 優質服務</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
