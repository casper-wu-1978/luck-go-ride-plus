
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // 登入
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "登入失敗",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "登入成功",
            description: "歡迎回來！",
          });
        }
      } else {
        // 註冊
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: name,
            }
          }
        });

        if (error) {
          toast({
            title: "註冊失敗",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "註冊成功",
            description: "請檢查您的電子郵件以確認帳戶",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-800 mb-2">Luck Go</h1>
          <p className="text-emerald-600">您的專屬叫車平台</p>
        </div>

        {/* Auth Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-800">
              {isLogin ? '登入帳戶' : '建立帳戶'}
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
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
                className="text-emerald-600 hover:text-emerald-800"
              >
                {isLogin ? '還沒有帳戶？立即註冊' : '已有帳戶？立即登入'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <div className="mt-6 text-center text-sm text-emerald-700">
          <p>測試帳戶：demo@example.com</p>
          <p>密碼：123456</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
