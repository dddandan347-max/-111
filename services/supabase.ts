
import { createClient } from '@supabase/supabase-js';

// 生产环境通常使用环境变量。但在该沙盒中，我们确保连接字符串与当前的 API 控制台匹配。
const supabaseUrl = 'https://ufgdyacczzdvsyeoahug.supabase.co';
// 注意：sb_publishable 是匿名秘钥，应当在控制台开启 RLS 以保证安全。
const supabaseKey = 'sb_publishable_a8xLmMhMcXpcvajeP-3Mpw_hVZh5h1S';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': 'studiosync',
    },
  },
});
