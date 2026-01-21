
import { createClient } from '@supabase/supabase-js';

// 用户提供的最新 Supabase 项目配置
const supabaseUrl = 'https://wyjvomiosxghxivizkfi.supabase.co';
const supabaseKey = 'sb_publishable_5ImID6_VMF2QCN0lO4DZDg_E6i8S2YH';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': 'studiosync-collab',
    },
  },
});
