
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Home, Building, Plus, Edit, Trash, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLiff } from "@/contexts/LiffContext";

interface FavoriteAddress {
  id: string;
  name: string;
  address: string;
  code: string;
  address_type: 'address' | 'code';
  icon: any;
}

const FavoriteAddresses = () => {
  const [addresses, setAddresses] = useState<FavoriteAddress[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isAddingCode, setIsAddingCode] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCode, setNewCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { profile: liffProfile, isLoading: liffLoading } = useLiff();
  const { toast } = useToast();

  // 載入地址資料
  useEffect(() => {
    if (liffProfile?.userId && !liffLoading) {
      loadAddresses();
    }
  }, [liffProfile, liffLoading]);

  const loadAddresses = async () => {
    if (!liffProfile?.userId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorite_addresses')
        .select('*')
        .eq('line_user_id', liffProfile.userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('載入地址錯誤:', error);
        toast({
          title: "載入失敗",
          description: "無法載入常用地址",
          variant: "destructive",
        });
        return;
      }

      const formattedAddresses = (data || []).map(addr => ({
        id: addr.id,
        name: addr.name,
        address: addr.address || "",
        code: addr.code || "",
        address_type: addr.address_type as 'address' | 'code',
        icon: addr.address_type === 'code' ? Hash : 
              addr.name.includes('家') ? Home : 
              addr.name.includes('公司') ? Building : MapPin,
      }));

      setAddresses(formattedAddresses);
    } catch (error) {
      console.error('載入地址錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!liffProfile?.userId) {
      toast({
        title: "請先登入",
        description: "需要登入才能新增地址",
        variant: "destructive",
      });
      return;
    }

    if (!newName || !newAddress) {
      toast({
        title: "請填寫完整資訊",
        description: "請輸入名稱和地址",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorite_addresses')
        .insert({
          line_user_id: liffProfile.userId,
          name: newName,
          address: newAddress,
          code: "",
          address_type: 'address',
          user_id: null
        })
        .select()
        .single();

      if (error) {
        console.error('新增地址錯誤:', error);
        toast({
          title: "新增失敗",
          description: "無法新增地址",
          variant: "destructive",
        });
        return;
      }

      const newAddressObj = {
        id: data.id,
        name: data.name,
        address: data.address || "",
        code: data.code || "",
        address_type: data.address_type as 'address' | 'code',
        icon: MapPin,
      };

      setAddresses([newAddressObj, ...addresses]);
      setNewName("");
      setNewAddress("");
      setIsAddingAddress(false);
      
      toast({
        title: "新增成功",
        description: "地址已新增",
      });
    } catch (error) {
      console.error('新增地址錯誤:', error);
      toast({
        title: "新增失敗",
        description: "發生未知錯誤",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCode = async () => {
    if (!liffProfile?.userId) {
      toast({
        title: "請先登入",
        description: "需要登入才能新增代碼",
        variant: "destructive",
      });
      return;
    }

    if (!newCode) {
      toast({
        title: "請填寫完整資訊",
        description: "請輸入代碼",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorite_addresses')
        .insert({
          line_user_id: liffProfile.userId,
          name: `代碼 ${newCode}`,
          address: "",
          code: newCode,
          address_type: 'code',
          user_id: null
        })
        .select()
        .single();

      if (error) {
        console.error('新增代碼錯誤:', error);
        toast({
          title: "新增失敗",
          description: "無法新增代碼",
          variant: "destructive",
        });
        return;
      }

      const newCodeObj = {
        id: data.id,
        name: data.name,
        address: data.address || "",
        code: data.code || "",
        address_type: data.address_type as 'address' | 'code',
        icon: Hash,
      };

      setAddresses([newCodeObj, ...addresses]);
      setNewCode("");
      setIsAddingCode(false);
      
      toast({
        title: "新增成功",
        description: "代碼已新增",
      });
    } catch (error) {
      console.error('新增代碼錯誤:', error);
      toast({
        title: "新增失敗",
        description: "發生未知錯誤",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!liffProfile?.userId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('favorite_addresses')
        .delete()
        .eq('id', id)
        .eq('line_user_id', liffProfile.userId);

      if (error) {
        console.error('刪除錯誤:', error);
        toast({
          title: "刪除失敗",
          description: "無法刪除地址",
          variant: "destructive",
        });
        return;
      }

      setAddresses(addresses.filter(addr => addr.id !== id));
      toast({
        title: "刪除成功",
        description: "地址已刪除",
      });
    } catch (error) {
      console.error('刪除錯誤:', error);
      toast({
        title: "刪除失敗",
        description: "發生未知錯誤",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (liffLoading || (isLoading && addresses.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!liffProfile?.userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">請先完成 LINE 登入</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Buttons */}
      {!isAddingAddress && !isAddingCode && (
        <div className="space-y-3">
          <Button 
            onClick={() => setIsAddingAddress(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            新增地址
          </Button>
          
          <Button 
            onClick={() => setIsAddingCode(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            新增代碼
          </Button>
        </div>
      )}

      {/* Add Address Form */}
      {isAddingAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">新增地址</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="addressName">名稱</Label>
              <Input
                id="addressName"
                placeholder="例如：家裡、公司、學校"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="addressDetail">地址</Label>
              <Input
                id="addressDetail"
                placeholder="請輸入完整地址"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button 
                onClick={handleAddAddress} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "新增中..." : "確認新增"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingAddress(false);
                  setNewName("");
                  setNewAddress("");
                }}
                className="flex-1"
                disabled={isLoading}
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Code Form */}
      {isAddingCode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-700">新增代碼</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="codeInput">代碼</Label>
              <p className="text-xs text-gray-500 mb-2">包廂號碼、房間號碼等</p>
              <Input
                id="codeInput"
                placeholder="例如：A101、VIP包廂、201房"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button 
                onClick={handleAddCode} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? "新增中..." : "確認新增"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingCode(false);
                  setNewCode("");
                }}
                className="flex-1"
                disabled={isLoading}
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address List */}
      <div className="space-y-3">
        {addresses.map((address) => {
          const Icon = address.icon;
          return (
            <Card key={address.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <Icon className="h-5 w-5 text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      {/* 地址區塊 */}
                      {address.address && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">{address.name}</h3>
                          <p className="text-sm text-gray-600">{address.address}</p>
                        </div>
                      )}
                      
                      {/* 純代碼區塊 */}
                      {!address.address && address.code && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-2">
                          <div className="flex items-center">
                            <Hash className="h-3 w-3 text-emerald-600 mr-1" />
                            <span className="text-xs font-medium text-emerald-700">{address.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-2">
                    <Button size="sm" variant="ghost" className="p-2">
                      <Edit className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="p-2"
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={isLoading}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {addresses.length === 0 && !isAddingAddress && !isAddingCode && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">尚未新增任何地址或代碼</p>
            <p className="text-sm text-gray-400 mt-1">新增地址或代碼讓叫車更便利</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FavoriteAddresses;
