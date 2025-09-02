import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylvwegrtvuyrjekcyvyn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdndlZ3J0dnV5cmpla2N5dnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDY1OTQsImV4cCI6MjA2NzMyMjU5NH0.Na4S5H1t9fjrOvAZapn8nk_QuDnxAUtSBWCNK4cVlWQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 