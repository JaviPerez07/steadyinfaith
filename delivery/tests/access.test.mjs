import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from '../worker.mjs';
function setup(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../migrations/0001.sql',import.meta.url),'utf8'));
 const adapt=(sql,args=[])=>({bind(...a){return adapt(sql,a)},async first(){return db.prepare(sql).get(...args)||null},async run(){return db.prepare(sql).run(...args)}});
 return {DB:{prepare:adapt,async batch(q){db.exec('BEGIN');try{const r=await Promise.all(q.map(x=>x.run()));db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}}},ASSETS:{async fetch(){return new Response('PRIVATE PRODUCT')}},STRIPE_WEBHOOK_SECRET:'whsec_test_only',STRIPE_PAYMENT_LINK_ID:'plink_expected',STRIPE_LIVE_MODE:'false',SALES_ENABLED:'false'};
}
const base='https://joinsteadyinfaith.com';
const sid='cs_test_abcdefghijklmnopqrstuvw';
const event=(id,overrides={})=>({id,type:'checkout.session.completed',livemode:false,data:{object:{id:sid,mode:'payment',payment_status:'paid',payment_link:'plink_expected',currency:'usd',amount_subtotal:1400,payment_intent:'pi_paid',...overrides}}});
async function signed(env,e,time=Math.floor(Date.now()/1000)){
 const raw=JSON.stringify(e),enc=new TextEncoder();const key=await crypto.subtle.importKey('raw',enc.encode(env.STRIPE_WEBHOOK_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const sig=Buffer.from(await crypto.subtle.sign('HMAC',key,enc.encode(time+'.'+raw))).toString('hex');
 return worker.fetch(new Request(base+'/reset/webhook',{method:'POST',body:raw,headers:{'Stripe-Signature':`t=${time},v1=${sig}`}}),env);
}
const claim=env=>worker.fetch(new Request(base+'/reset/claim?session_id='+sid),env);
test('anonymous users cannot read app, PDF, offline HTML or raw assets',async()=>{
 const env=setup();for(const p of ['/reset/access-key','/reset/app','/reset/download/fillable','/reset/download/offline','/30-Day-Faith-Reset-Interactive.html']){
  const r=await worker.fetch(new Request(base+p),env);assert.ok([401,404].includes(r.status));assert.doesNotMatch(await r.text(),/PRIVATE PRODUCT/);
 }
});
test('fake session and unsigned event never authorize access',async()=>{
 const env=setup();assert.equal((await claim(env)).status,202);
 assert.equal((await worker.fetch(new Request(base+'/reset/webhook',{method:'POST',body:JSON.stringify(event('evt_fake'))}),env)).status,400);
 assert.equal((await claim(env)).status,202);
});
test('wrong amount, product, currency, unpaid and wrong Stripe mode never fulfill',async()=>{
 for(const o of [{amount_subtotal:900},{payment_link:'plink_other'},{currency:'eur'},{payment_status:'unpaid'}]){
  const env=setup();await signed(env,event('evt_bad',o));assert.equal((await claim(env)).status,202);
 }
 const env=setup(),e=event('evt_live');e.livemode=true;assert.equal((await signed(env,e)).status,400);
 assert.equal((await claim(env)).status,202);
});
test('valid payment grants protected library and recovery key, replay is idempotent',async()=>{
 const env=setup();assert.equal((await signed(env,event('evt_good'))).status,200);assert.equal((await signed(env,event('evt_good'))).status,200);
 const response=await claim(env);assert.equal(response.status,200);const c=response.headers.get('Set-Cookie');assert.match(c,/HttpOnly; Secure; SameSite=Lax/);
 const html=await response.text();const key=html.match(/<code>([a-f0-9]{64})<\/code>/)[1];
 const page=await worker.fetch(new Request(base+'/reset/app',{headers:{Cookie:c.split(';')[0]}}),env);assert.equal(await page.text(),'PRIVATE PRODUCT');assert.match(page.headers.get('Cache-Control'),/no-store/);
 const keyFile=await worker.fetch(new Request(base+'/reset/access-key',{headers:{Cookie:c.split(';')[0]}}),env);assert.equal(keyFile.status,200);assert.ok((await keyFile.text()).includes(key));
 const recovered=await worker.fetch(new Request(base+'/reset/access',{method:'POST',headers:{Origin:base},body:new URLSearchParams({key})}),env);assert.equal(recovered.status,303);
 const forged=await worker.fetch(new Request(base+'/reset/app',{headers:{Cookie:'steady_reset='+'a'.repeat(64)}}),env);assert.equal(forged.status,401);
});
test('delayed payments grant access only after async success',async()=>{
 const env=setup();await signed(env,event('evt_pending',{payment_status:'unpaid'}));assert.equal((await claim(env)).status,202);
 const e=event('evt_async');e.type='checkout.session.async_payment_succeeded';await signed(env,e);assert.equal((await claim(env)).status,200);
});
test('refund/dispute revokes access even when it arrives before payment event',async()=>{
 for(const type of ['charge.refunded','charge.dispute.created'])for(const first of [true,false]){
  const env=setup();const refund={id:'evt_refund',type,livemode:false,data:{object:{payment_intent:'pi_paid'}}};
  if(first)await signed(env,refund);await signed(env,event('evt_paid'));if(!first)await signed(env,refund);
  assert.equal((await claim(env)).status,202);
 }
});
test('expired signatures and cross-origin recovery requests are rejected',async()=>{
 const env=setup();assert.equal((await signed(env,event('evt_old'),1)).status,400);
 const r=await worker.fetch(new Request(base+'/reset/access',{method:'POST',headers:{Origin:'https://evil.example'},body:new URLSearchParams({key:'a'.repeat(64)})}),env);assert.equal(r.status,403);
});
test('sales fail closed until link and explicit activation exist',async()=>{
 assert.equal((await worker.fetch(new Request(base+'/reset/checkout'),setup())).status,503);
});
