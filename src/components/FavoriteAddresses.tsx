
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
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCode, setNewCode] = useState("");
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
      code: newCode,
      icon: MapPin,
    };

    setAddresses([...addresses, newAddressObj]);
    setNewName("");
    setNewAddress("");
    setNewCode("");
    setIsAdding(false);
    
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

  return (
    <div className="space-y-6">
      {/* Add Address Button */}
      {!isAdding && (
        <Button 
          onClick={() => setIsAdding(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
        >
          <Plus className="h-4 w-4 mr-2" />
          新增地址
        </Button>
      )}

      {/* Add Address Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-700">新增地址</CardTitle>
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

            <div>
              <Label htmlFor="addressCode">代碼（選填）</Label>
              <Input
                id="addressCode"
                placeholder="例如：包廂號碼、房間號碼"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddAddress} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                確認新增
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setNewName("");
                  setNewAddress("");
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
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{address.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{address.address}</p>
                      {address.code && (
                        <div className="flex items-center">
                          <Hash className="h-3 w-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500">{address.code}</p>
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

      {addresses.length === 0 && !isAdding && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">尚未新增任何地址</p>
            <p className="text-sm text-gray-400 mt-1">新增地址讓叫車更便利</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FavoriteAddresses;
