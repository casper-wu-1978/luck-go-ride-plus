
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Mail, Lock, User, ArrowRight, Shield, AlertCircle } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, isLoading, signIn, signUp } = useAdminAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 如果已登入，導向管理頁面
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/admin');
    }
  }, [user, isLoading, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // 登入
        const { error } = await signIn(email, password);

        if (error) {
          let errorMessage = "登入失敗";
          
          if (error.message?.includes('Invalid login credentials')) {
            errorMessage = "電子郵件或密碼錯誤";
          } else if (error.message?.includes('Email not confirmed')) {
            errorMessage = "電子郵件尚未確認，請檢查您的信箱或聯繫管理員";
          } else {
            errorMessage = error.message;
          }

          toast({
            title: "登入失敗",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "登入成功",
            description: "歡迎回來！",
          });
          navigate('/admin');
        }
      } else {
        // 註冊
        const { error } = await signUp(email, password, name);

        if (error) {
          toast({
            title: "註冊處理",
            description: error.message || "註冊失敗，請稍後再試",
            variant: error.message?.includes('註冊成功') ? "default" : "destructive",
          });
          
          // 如果註冊成功但需要確認，切換到登入模式
          if (error.message?.includes('註冊成功')) {
            setIsLogin(true);
          }
        } else {
          toast({
            title: "註冊成功",
            description: "帳戶創建成功，正在登入...",
          });
        }
      }
    } catch (error) {
      toast({
        title: "發生錯誤",
        description: "請稍後再試",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-purple-800">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-purple-600 mr-3" />
            <div>
              <h1 className="text-4xl font-bold text-purple-800">Luck Go</h1>
              <p className="text-purple-600">管理員系統</p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-800">
              {isLogin ? '管理員登入' : '建立管理員帳戶'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="請輸入您的姓名"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">電子郵件</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="請輸入電子郵件"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密碼</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="請輸入密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    處理中...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {isLogin ? '登入' : '註冊'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-purple-600 hover:text-purple-800"
              >
                {isLogin ? '還沒有帳戶？立即註冊' : '已有帳戶？立即登入'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Confirmation Notice */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">電子郵件確認說明</p>
              <p>註冊後如需要電子郵件確認，請檢查您的信箱。如果沒有收到確認郵件，請聯繫系統管理員。</p>
            </div>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-4 text-center text-sm text-purple-700 bg-purple-50 p-3 rounded-lg">
          <p className="font-medium mb-1">測試帳戶</p>
          <p>Email: admin@luckgo.com</p>
          <p>密碼: 123456</p>
        </div>

        {/* Back to Main */}
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            返回首頁
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
