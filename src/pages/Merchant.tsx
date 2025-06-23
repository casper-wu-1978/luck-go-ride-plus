
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Store, Car, History, User, Coins } from "lucide-react";
import CallCar from "@/components/CallCar";
import OrderHistory from "@/components/OrderHistory";
import Profile from "@/components/Profile";
import Rewards from "@/components/Rewards";

const Merchant = () => {
  const [activeTab, setActiveTab] = useState("call");

  const navItems = [
    { id: "call", label: "叫車", icon: Car, component: CallCar },
    { id: "history", label: "紀錄", icon: History, component: OrderHistory },
    { id: "rewards", label: "回饋", icon: Coins, component: Rewards },
    { id: "profile", label: "商家", icon: User, component: Profile },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 pb-20">
        {/* Header */}
        <div className="py-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-green-600 mr-2" />
            <h1 className="text-3xl font-bold text-green-800">商家端</h1>
          </div>
          <p className="text-green-600">為客戶提供叫車服務</p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {navItems.map((item) => (
            <TabsContent key={item.id} value={item.id} className="mt-0">
              <item.component />
            </TabsContent>
          ))}
        </Tabs>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex justify-around items-center py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-green-500"
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Merchant;
