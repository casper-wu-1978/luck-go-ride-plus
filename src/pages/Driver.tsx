
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Car, FileText, CreditCard, User } from "lucide-react";
import DriverOrders from "@/components/driver/DriverOrders";
import DriverHistory from "@/components/driver/DriverHistory";
import DriverEarnings from "@/components/driver/DriverEarnings";
import DriverProfile from "@/components/DriverProfile";

const Driver = () => {
  const [activeTab, setActiveTab] = useState("orders");

  const navItems = [
    { id: "orders", label: "接單", icon: Car, component: DriverOrders },
    { id: "history", label: "紀錄", icon: FileText, component: DriverHistory },
    { id: "earnings", label: "收費", icon: CreditCard, component: DriverEarnings },
    { id: "profile", label: "個資", icon: User, component: DriverProfile },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 pb-20">
        {/* Header */}
        <div className="py-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-blue-800">司機端</h1>
          </div>
          <p className="text-blue-600">開始您的接單服務</p>
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
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-blue-500"
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

export default Driver;
