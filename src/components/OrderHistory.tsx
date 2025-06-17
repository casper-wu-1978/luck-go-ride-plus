
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, MapPin, Clock, CreditCard } from "lucide-react";

const OrderHistory = () => {
  const orders = [
    {
      id: "#LG2024061501",
      date: "2024-06-15",
      time: "14:30",
      from: "台北車站",
      to: "信義區A11",
      fare: 180,
      status: "completed",
      driver: "王師傅",
    },
    {
      id: "#LG2024061401", 
      date: "2024-06-14",
      time: "09:15",
      from: "公司大樓",
      to: "台北101",
      fare: 220,
      status: "completed",
      driver: "李師傅",
    },
    {
      id: "#LG2024061301",
      date: "2024-06-13",
      time: "18:45",
      from: "餐廳",
      to: "家裡",
      fare: 150,
      status: "completed",
      driver: "張師傅",
    },
    {
      id: "#LG2024061201",
      date: "2024-06-12",
      time: "12:00",
      from: "醫院",
      to: "藥局",
      fare: 85,
      status: "cancelled",
      driver: "-",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">已完成</Badge>;
      case "cancelled":
        return <Badge variant="destructive">已取消</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  const getTotalAmount = () => {
    return orders
      .filter(order => order.status === "completed")
      .reduce((total, order) => total + order.fare, 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <CardContent className="p-6 text-center">
          <History className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-xl font-bold mb-2">訂單歷史</h2>
          <p className="opacity-90">總計 {orders.length} 筆訂單</p>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{orders.filter(o => o.status === "completed").length}</p>
            <p className="text-sm text-gray-600">完成訂單</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">NT$ {getTotalAmount().toLocaleString()}</p>
            <p className="text-sm text-gray-600">總消費</p>
          </CardContent>
        </Card>
      </div>

      {/* Order List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-emerald-700">
            <Clock className="h-5 w-5 mr-2" />
            最近訂單
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{order.id}</span>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">{order.from}</p>
                      <p className="text-gray-600">到 {order.to}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {order.date} {order.time}
                    </div>
                    {order.status === "completed" && (
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1" />
                        NT$ {order.fare}
                      </div>
                    )}
                  </div>
                  
                  {order.driver !== "-" && (
                    <p className="text-sm text-gray-600">司機：{order.driver}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderHistory;
