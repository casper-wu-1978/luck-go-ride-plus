
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Shield, Store } from "lucide-react";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { profile } = useLiff();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (role: 'driver' | 'admin' | 'merchant') => {
    if (!profile?.userId) {
      toast({
        title: "錯誤",
        description: "無法獲取用戶資訊",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 插入用戶角色
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          line_user_id: profile.userId,
          role: role
        });

      if (roleError) {
        console.error('角色設定錯誤:', roleError);
        toast({
          title: "設定失敗",
          description: "角色設定失敗，請稍後再試",
          variant: "destructive",
        });
        return;
      }

      // 根據角色創建對應的 profile
      if (role === 'admin') {
        await supabase.from('admin_profiles').insert({
          line_user_id: profile.userId,
          name: profile.displayName || '管理員',
        });
      } else if (role === 'merchant') {
        await supabase.from('merchant_profiles').insert({
          line_user_id: profile.userId,
          business_name: '我的商家',
          contact_name: profile.displayName || '聯絡人',
        });
      }

      toast({
        title: "設定成功",
        description: `已設定為${role === 'driver' ? '司機' : role === 'admin' ? '管理員' : '商家'}身份`,
      });

      // 導向對應頁面
      navigate(`/${role}`);
    } catch (error) {
      console.error('角色設定錯誤:', error);
      toast({
        title: "設定失敗",
        description: "發生未知錯誤",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'driver',
      title: '司機端',
      description: '接受叫車訂單，管理行程',
      icon: Car,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'merchant',
      title: '商家端',
      description: '為客戶叫車，管理訂單',
      icon: Store,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'admin',
      title: '管理員',
      description: '系統管理，訂單監控',
      icon: Shield,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-emerald-800 mb-4">Luck Go</h1>
          <p className="text-emerald-600 text-lg mb-8">請選擇您的身份</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full ${role.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{role.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleRoleSelect(role.id as 'driver' | 'admin' | 'merchant')}
                    disabled={isLoading}
                    className={`w-full ${role.color} text-white`}
                  >
                    {isLoading ? '設定中...' : '選擇此身份'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            選擇身份後可以隨時切換或聯繫管理員修改
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
