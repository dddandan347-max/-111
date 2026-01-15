import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ufgdyacczzdvsyeoahug.supabase.co';
const supabaseKey = 'sb_publishable_a8xLmMhMcXpcvajeP-3Mpw_hVZh5h1S';

export const supabase = createClient(supabaseUrl, supabaseKey);