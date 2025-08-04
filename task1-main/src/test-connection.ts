import { supabase } from './utils/supabase.js'

async function testConnection() {
  const { data, error } = await supabase
    .from('passenger_queue')
    .select('*')
    
  console.log('Connection test results:', { data, error })
}

testConnection()