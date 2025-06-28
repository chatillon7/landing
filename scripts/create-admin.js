// Tek seferlik çalıştırılacak admin oluşturma scripti
// KULLANIM: node scripts/create-admin.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey || !adminEmail || !adminPassword) {
  console.error('Gerekli ortam değişkenleri eksik! .env.local dosyanızı kontrol edin.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
  });
  if (error && !error.message.includes('User already registered')) {
    console.error('Admin hesabı oluşturulamadı:', error.message);
    return;
  }
  console.log('Admin hesabı oluşturuldu:', adminEmail);
  console.log('E-posta onayı için SQL fonksiyonunu Supabase SQL Editor üzerinden manuel çalıştırmalısınız.');
}

createAdmin();
