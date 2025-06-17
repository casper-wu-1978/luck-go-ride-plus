
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LineNotificationRequest {
  userId: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, message }: LineNotificationRequest = await req.json();
    
    const channelAccessToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
    
    if (!channelAccessToken) {
      console.error("LINE_CHANNEL_ACCESS_TOKEN not found");
      return new Response(
        JSON.stringify({ error: "LINE Channel Access Token not configured" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

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

    if (!lineResponse.ok) {
      const errorText = await lineResponse.text();
      console.error("LINE API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to send LINE message", details: errorText }),
        { 
          status: lineResponse.status, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const result = await lineResponse.json();
    console.log("LINE message sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-line-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
