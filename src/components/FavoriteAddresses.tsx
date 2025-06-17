import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Home, Building, Plus, Edit, Trash, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FavoriteAddresses = () => {
  const [addresses, setAddresses] = useState([
    { 
      id: 1, 
      name: "家裡", 
      address: "台北市信義區信義路五段7號", 
      code: "A101",
      icon: Home 
    },
    { 
      id: 2, 
      name: "公司", 
      address: "台北市松山區敦化北路100號", 
      code: "B302",
      icon: Building 
    },
  ]);
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isAddingCode, setIsAddingCode] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCode, setNewCode] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleAddAddress = () => {
    if (!newName || !newAddress) {
      toast({
        title: "請填寫完整資訊",
        description: "請輸入名稱和地址",
        variant: "destructive",
      });
      return;
    }

    const newAddressObj = {
      id: Date.now(),
      name: newName,
      address: newAddress,
      code: "",
      icon: MapPin,
    };

    setAddresses([...addresses, newAddressObj]);
    setNewName("");
    setNewAddress("");
    setIsAddingAddress(false);
    
    toast({
      title: "新增成功",
      description: "地址已新增",
    });
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
    toast({
      title: "刪除成功",
      description: "地址已刪除",
    });
  };

  const handleAddCode = () => {
    if (!newCode) {
      toast({
        title: "請填寫完整資訊",
        description: "請輸入代碼",
        variant: "destructive",
      });
      return;
    }

    const newCodeObj = {
      id: Date.now(),
      name: `代碼 ${newCode}`,
      address: "",
      code: newCode,
      icon: Hash,
    };

    setAddresses([...addresses, newCodeObj]);
    setNewCode("");
    setIsAddingCode(false);
    
    toast({
      title: "新增成功",
      description: "代碼已新增",
    });
  };

  return (
    <div className="space-y-6">
      {/* Add Buttons */}
      {!isAddingAddress && !isAddingCode && (
        <div className="space-y-3">
          <Button 
            onClick={() => setIsAddingAddress(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            新增地址
          </Button>
          
          <Button 
            onClick={() => setIsAddingCode(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
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
              <Button onClick={handleAddAddress} className="flex-1 bg-blue-600 hover:bg-blue-700">
                確認新增
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingAddress(false);
                  setNewName("");
                  setNewAddress("");
                }}
                className="flex-1"
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
              <Button onClick={handleAddCode} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                確認新增
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingCode(false);
                  setNewCode("");
                }}
                className="flex-1"
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
                    <div className="flex-1 space-y-3">
                      {/* 地址區塊 */}
                      {address.address && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">{address.name}</h3>
                          <p className="text-sm text-gray-600">{address.address}</p>
                        </div>
                      )}
                      
                      {/* 代碼區塊 */}
                      {address.code && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-2">
                          <div className="flex items-center">
                            <Hash className="h-3 w-3 text-emerald-600 mr-1" />
                            {address.address ? (
                              <>
                                <span className="text-xs font-medium text-emerald-700">代碼：</span>
                                <span className="text-xs text-emerald-600 ml-1">{address.code}</span>
                              </>
                            ) : (
                              <>
                                <span className="text-xs font-medium text-emerald-700">{address.name}</span>
                              </>
                            )}
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
      {addresses.length === 0 && !isAddingAddress && !isAddingCode && (
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
