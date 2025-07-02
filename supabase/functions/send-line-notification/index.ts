
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LineNotificationRequest {
  userId: string;
  message: string;
  isDriver?: boolean; // New flag to identify driver messages
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 收到 LINE 通知請求');
    
    const { userId, message, isDriver = false }: LineNotificationRequest = await req.json();
    console.log('📋 請求內容:', { 
      userId: userId?.substring(0, 10) + '...', 
      messageLength: message?.length,
      isDriver 
    });
    
    // Use different channel access tokens for drivers vs merchants
    let channelAccessToken;
    if (isDriver) {
      // Use your driver channel token
      channelAccessToken = "HiFVVfPZFM/6/AABxLKY2kSu0ZMyzZIrCTXN4R09tOkvliNnkpQrXHMnrQBxErMNb+aIioMa+dkC4xvbtRGl6p5rzxenoJdnY3SWqwme4wk7XBgciZRR8GGOvZTTysEAfe3NqkAt3GNqclcZQ1rQkgdB04t89/1O/w1cDnyilFU=";
      console.log('📱 使用司機頻道發送訊息');
    } else {
      // Use the original channel token for merchants
      channelAccessToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
      console.log('📱 使用商家頻道發送訊息');
    }
    
    if (!channelAccessToken) {
      console.error("❌ LINE Channel Access Token 未設定");
      return new Response(
        JSON.stringify({ error: "LINE Channel Access Token not configured" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    if (!userId) {
      console.error("❌ 缺少 userId");
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    if (!message) {
      console.error("❌ 缺少 message");
      return new Response(
        JSON.stringify({ error: "Missing message" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log('🚀 準備發送 LINE 推播...');
    console.log('📱 目標用戶:', userId);
    console.log('💬 訊息長度:', message.length);
    console.log('🎯 頻道類型:', isDriver ? '司機頻道' : '商家頻道');

    // Send push message to LINE user
    const lineResponse = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      }),
    });

    console.log('📡 LINE API 回應狀態:', lineResponse.status);

    if (!lineResponse.ok) {
      const errorText = await lineResponse.text();
      console.error("❌ LINE API 錯誤:", {
        status: lineResponse.status,
        statusText: lineResponse.statusText,
        error: errorText
      });
      
      // 根據不同的錯誤狀態提供更具體的錯誤信息
      let errorMessage = "Failed to send LINE message";
      if (lineResponse.status === 400) {
        errorMessage = "Invalid request format or user ID";
      } else if (lineResponse.status === 401) {
        errorMessage = "Invalid LINE Channel Access Token";
      } else if (lineResponse.status === 403) {
        errorMessage = "User has blocked the bot or bot cannot send messages to this user";
      } else if (lineResponse.status === 429) {
        errorMessage = "Rate limit exceeded";
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          details: errorText,
          status: lineResponse.status 
        }),
        { 
          status: lineResponse.status, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const result = await lineResponse.json();
    console.log("✅ LINE 訊息發送成功:", result);

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ send-line-notification function 錯誤:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: error.name || 'UnknownError'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
