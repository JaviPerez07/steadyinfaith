const FILES = {
 guide: 'START-HERE.pdf',
 fillable: '30-Day-Faith-Reset-Interactive-Fillable.pdf',
 print: '30-Day-Faith-Reset-Interactive-Printable.pdf',
 offline: '30-Day-Faith-Reset-Interactive.html',
};
const enc = new TextEncoder();
export async function hash(text) {
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function eq(a,b) { if(a.length!==b.length)return false; let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0; }
export async function validSignature(body, header, secret, now=Date.now()) {
 if(!secret || !header)return false;
 const parts=header.split(',').map(x=>x.trim().split('='));
 const ts=parts.find(([k])=>k==='t')?.[1];
 if(!ts || !/^\d+$/.test(ts) || Math.abs(now/1000-Number(ts))>300)return false;
 const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const digest=[...new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(ts+'.'+body)))].map(x=>x.toString(16).padStart(2,'0')).join('');
 return parts.some(([k,v])=>k==='v1' && eq(v,digest));
}
const security = {
 'Cache-Control':'private, no-store', 'Referrer-Policy':'no-referrer',
 'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY',
 'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' data:; font-src data:; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
};
function reply(body,status=200,extra={}) {return new Response(body,{status,headers:{...security,...extra}});}
function escape(s) {return String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}
function page(title,body,status=200,extra={}) {
 return reply(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escape(title)} · Steady in Faith</title><style>body{margin:0;background:#101215;color:#f7f2e8;font:18px/1.65 system-ui,sans-serif}main{max-width:760px;margin:auto;padding:40px 22px}h1{font-size:clamp(32px,6vw,48px);line-height:1.2}h2{font-size:24px}a{color:#f0cd8d}a.button,button{display:inline-block;padding:14px 20px;background:#edc77e;color:#151719;border:0;border-radius:8px;font:600 17px/1.4 system-ui;text-decoration:none;margin:8px 0;cursor:pointer}article{border:1px solid #4b4b47;border-radius:12px;padding:22px;margin:24px 0}input{box-sizing:border-box;width:100%;padding:14px;font:18px system-ui;border-radius:8px;border:1px solid #aaa}code{display:block;overflow-wrap:anywhere;background:#24272a;padding:16px;font-size:16px}small{font-size:15px}li{margin:12px 0}</style><main><a href="/">STEADY IN FAITH</a><h1>${escape(title)}</h1>${body}</main></html>`,status,{'Content-Type':'text/html; charset=utf-8',...extra});
}
const cookie = token => `steady_reset=${token}; Path=/reset; Max-Age=7776000; HttpOnly; Secure; SameSite=Lax`;
async function authenticated(request,env) {
 const token=request.headers.get('Cookie')?.match(/(?:^|;\s*)steady_reset=([a-f0-9]{64})(?:;|$)/)?.[1];
 if(!token)return null;
 return env.DB.prepare('SELECT o.session_hash FROM orders o LEFT JOIN revoked_payments r ON r.payment_intent=o.payment_intent WHERE o.token_hash=? AND r.payment_intent IS NULL').bind(await hash(token)).first();
}
async function limited(request,env) {
 const ip=request.headers.get('CF-Connecting-IP')||'local';
 const window=Math.floor(Date.now()/600000);
 const key=await hash(ip+':'+window);
 await env.DB.prepare('INSERT INTO attempts(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').bind(key,Date.now()+600000).run();
 const row=await env.DB.prepare('SELECT count FROM attempts WHERE key=?').bind(key).first();
 await env.DB.prepare('DELETE FROM attempts WHERE expires<?').bind(Date.now()).run();
 return row.count>20;
}
async function webhook(request,env) {
 if(!env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_PAYMENT_LINK_ID)return reply('Not configured',503);
 if(Number(request.headers.get('Content-Length'))>262144)return reply('Too large',413);
 const raw=await request.text();
 if(raw.length>262144)return reply('Too large',413);
 if(!await validSignature(raw,request.headers.get('Stripe-Signature'),env.STRIPE_WEBHOOK_SECRET))return reply('Invalid signature',400);
 let event;try{event=JSON.parse(raw);}catch{return reply('Invalid JSON',400);}
 if(!event.id || !event.data?.object)return reply('Invalid event',400);
 if(event.livemode!==(env.STRIPE_LIVE_MODE==='true'))return reply('Wrong mode',400);
 if(await env.DB.prepare('SELECT id FROM webhook_events WHERE id=?').bind(event.id).first())return reply('Already handled');
 const o=event.data.object;const queries=[];
 if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)) {
  if(o.payment_status==='paid' && o.mode==='payment' && o.payment_link===env.STRIPE_PAYMENT_LINK_ID && o.currency==='usd' && o.amount_subtotal===1400 && typeof o.payment_intent==='string' && /^cs_/.test(o.id)) {
   queries.push(env.DB.prepare('INSERT INTO orders(session_hash,payment_intent,created_at) VALUES(?,?,?) ON CONFLICT(session_hash) DO NOTHING').bind(await hash(o.id),o.payment_intent,Date.now()));
  }
 } else if(event.type==='charge.refunded' || event.type==='charge.dispute.created') {
  if(typeof o.payment_intent==='string')queries.push(env.DB.prepare('INSERT OR IGNORE INTO revoked_payments(payment_intent) VALUES(?)').bind(o.payment_intent));
 }
 queries.push(env.DB.prepare('INSERT INTO webhook_events(id,received_at) VALUES(?,?)').bind(event.id,Date.now()));
 await env.DB.batch(queries);return reply('OK');
}
function library(token) {
 const recovery=token?`<article><h2>Save your personal access key</h2><p>This key lets you open your purchase on another device. Keep it private: anyone with it can access your copy.</p><code>${escape(token)}</code><p>Copy it into your password manager or a safe note. Return to <strong>joinsteadyinfaith.com/reset</strong> to use it.</p></article>`:'';
 return `<p>Your 30-day companion is ready. Begin with your intention, then take one small step each day.</p><a class="button" href="/reset/app">Open my interactive Reset</a>${recovery}<article><h2>Your downloads</h2><p><a href="/reset/access-key">Save my access key</a> — keep this private to return on another device.</p><ul><li><a href="/reset/download/guide">Start here — instructions</a></li><li><a href="/reset/download/fillable">Fillable workbook PDF</a></li><li><a href="/reset/download/print">Printable workbook PDF</a></li><li><a href="/reset/download/offline">Offline edition for a computer</a></li></ul></article><h2>On your phone</h2><p>Use the interactive Reset in Safari or Chrome. Your answers stay in this browser, on this device. They do not sync automatically. Use the app’s Backup feature regularly and before changing devices or clearing browser data.</p><p><a href="https://www.skool.com/steady-in-faith-9349/about" rel="noreferrer">Join our free Skool community</a> — a free Skool account is required. No VIP subscription is included.</p><form method="post" action="/reset/logout"><button>Sign out of this device</button></form>`;
}
export default {
 async fetch(request,env) {
  try {
   const url=new URL(request.url),p=url.pathname;
   if(p==='/reset/webhook' && request.method==='POST')return await webhook(request,env);
   if(!['GET','HEAD','POST'].includes(request.method))return reply('Method not allowed',405);
   if(request.method==='POST' && request.headers.get('Origin')!==url.origin)return reply('Forbidden',403);
   if(p==='/reset/checkout') {
    if(env.SALES_ENABLED!=='true' || !env.PAYMENT_LINK_URL?.startsWith('https://buy.stripe.com/'))return page('Opening soon','<p>Purchases are not open yet. The original free Reset remains available in our community.</p><a href="https://www.skool.com/steady-in-faith-9349/about">Begin the free Reset</a>',503);
    return reply('',303,{Location:env.PAYMENT_LINK_URL});
   }
   if(p==='/reset/claim' && request.method==='GET') {
    if(await limited(request,env))return reply('Please try again in ten minutes.',429);
    const sid=url.searchParams.get('session_id')||'';
    if(!/^cs_(?:test_|live_)?[A-Za-z0-9]{16,240}$/.test(sid))return page('Purchase access','<p>Use the access key saved after your purchase.</p><a href="/reset">Enter my key</a>',400);
    const row=await env.DB.prepare('SELECT o.session_hash FROM orders o LEFT JOIN revoked_payments r ON o.payment_intent=r.payment_intent WHERE o.session_hash=? AND r.payment_intent IS NULL').bind(await hash(sid)).first();
    if(!row)return page('Confirming your payment','<p>Access opens after Stripe confirms payment. Some payment methods take longer. Refresh this page in a moment; do not pay again.</p><button onclick="location.reload()">Check again</button><script>setTimeout(()=>location.reload(),8000)</script>',202);
    const token=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');
    await env.DB.prepare('UPDATE orders SET token_hash=? WHERE session_hash=?').bind(await hash(token),row.session_hash).run();
    return page('Welcome to your Faith Reset',library(token)+'<script>history.replaceState(null,"","/reset/library")</script>',200,{'Set-Cookie':cookie(token)});
   }
   if(p==='/reset/access' && request.method==='POST') {
    if(await limited(request,env))return reply('Please try again in ten minutes.',429);
    const data=await request.formData();const token=String(data.get('key')||'').trim();
    if(!/^[a-f0-9]{64}$/.test(token))return page('Check your access key','<p>The key was not recognized.</p><a href="/reset">Try again</a>',403);
    const fake=new Request(url,{headers:{Cookie:'steady_reset='+token}});
    if(!await authenticated(fake,env))return page('Check your access key','<p>The key was not recognized or access is no longer active.</p><a href="/reset">Try again</a>',403);
    return reply('',303,{Location:'/reset/library','Set-Cookie':cookie(token)});
   }
   if(p==='/reset/logout' && request.method==='POST')return reply('',303,{Location:'/reset','Set-Cookie':'steady_reset=; Path=/reset; Max-Age=0; HttpOnly; Secure; SameSite=Lax'});
   if(p==='/reset' || p==='/reset/') {
    if(await authenticated(request,env))return reply('',303,{Location:'/reset/library'});
    return page('Your Faith Reset','<p>Already purchased? Enter the personal access key you saved after checkout.</p><form action="/reset/access" method="post"><label for="key">Personal access key</label><input id="key" name="key" type="password" required autocomplete="off" maxlength="64"><button>Open my purchase</button></form><p><a href="/reset/checkout">Get the interactive edition — $14 USD</a></p>');
   }
   if(p==='/reset/access-key' || p==='/reset/library' || p==='/reset/app' || p.startsWith('/reset/download/')) {
    if(!await authenticated(request,env))return page('Buyer access required','<p>Sign in with your purchase key to open the interactive Reset or download your files.</p><a class="button" href="/reset">Open buyer access</a>',401);
    if(p==='/reset/access-key'){const token=request.headers.get('Cookie').match(/steady_reset=([a-f0-9]{64})/)[1];return reply('STEADY IN FAITH — YOUR PRIVATE ACCESS KEY\n\nVisit https://joinsteadyinfaith.com/reset\nEnter this key: '+token+'\n\nKeep this file private. Journal answers are stored separately; use Backup in the app.\n',200,{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename=Steady-Faith-Reset-access-key.txt'});}
    if(p==='/reset/library')return page('Your Faith Reset library',library());
    const name=p==='/reset/app'?FILES.offline:(Object.hasOwn(FILES,p.slice('/reset/download/'.length))?FILES[p.slice('/reset/download/'.length)]:null);
    if(!name)return reply('Not found',404);
    const asset=await env.ASSETS.fetch(new Request(new URL('/'+name,url.origin)));
    if(!asset.ok)return reply('File unavailable',503);
    return reply(asset.body,200,{'Content-Type':name.endsWith('.pdf')?'application/pdf':'text/html; charset=utf-8',...(p!=='/reset/app'?{'Content-Disposition':`attachment; filename="${name}"`}:{})});
   }
   return reply('Not found',404);
  }catch {return reply('Temporarily unavailable. Please try again.',503);}
 }
};
