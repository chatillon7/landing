// Middleware devre dışı bırakıldı. Supabase Auth için sadece client-side kontrol kullanılacak.
// import { NextRequest, NextResponse } from 'next/server';
// İsteğe bağlı: Supabase ile token doğrulama yapılabilir import { supabase } from '../lib/supabaseClient';

// export async function middleware(req: NextRequest) {
//   // Supabase çerez adı projenize özel: sb-kglwjnasrimazocdlfla-access-token
//   const token = req.cookies.get('sb-kglwjnasrimazocdlfla-access-token')?.value;
//   const isLoginPage = req.nextUrl.pathname === "/admin/login";
//   if (!token && !isLoginPage) {
//     return NextResponse.redirect(new URL('/admin/login', req.url));
//   }
//   if (token && isLoginPage) {
//     return NextResponse.redirect(new URL('/admin', req.url));
//   }
//   // İsteğe bağlı: Supabase ile token doğrulama yapılabilir
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/admin/:path*'],
// };
