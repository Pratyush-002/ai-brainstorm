import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://magqofdfokleqvoixccf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZ3FvZmRmb2tsZXF2b2l4Y2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTI1MTAsImV4cCI6MjA4ODcyODUxMH0.n1rAT3DBvPZhrrPb5wPNvEshkxVbDSh8nqGMhxl3jt0";

export const supabase = createClient(supabaseUrl, supabaseKey);