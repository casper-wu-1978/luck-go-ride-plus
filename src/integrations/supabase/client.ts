// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jpxrfiongmyptlkbwsfp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweHJmaW9uZ215cHRsa2J3c2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjU3NzAsImV4cCI6MjA2NTc0MTc3MH0.5qgJq27vHNLsr_IUEWdp6Qx-gsjrglOWkKQfIfDAavM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);