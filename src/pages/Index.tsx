
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Car, Gift, History, MapPin, User } from "lucide-react";
import CallCar from "@/components/CallCar";
import Rewards from "@/components/Rewards";
import OrderHistory from "@/components/OrderHistory";
import FavoriteAddresses from "@/components/FavoriteAddresses";
import Profile from "@/components/Profile";

const Index = () => {
  const [activeTab, setActiveTab] = useState("call");

  const navItems = [
    { id: "call", label: "叫車", icon: Car, component: CallCar },
    { id: "rewards", label: "回饋", icon: Gift, component: Rewards },
    { id: "history", label: "紀錄", icon: History, component: OrderHistory },
    { id: "favorites", label: "常用", icon: MapPin, component: FavoriteAddresses },
    { id: "profile", label: "個資", icon: User, component: Profile },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col">
      <div className="container mx-auto max-w-md px-4 pb-20 flex-1 flex flex-col">
        {/* Header */}
        <div className="py-6 text-center">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">Luck Go</h1>
          <p className="text-emerald-600">您的專屬叫車平台</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {navItems.map((item) => (
              <TabsContent key={item.id} value={item.id} className="mt-0">
                <item.component />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex justify-around items-center py-2 max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-gray-500 hover:text-emerald-500"
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

export default Index;
