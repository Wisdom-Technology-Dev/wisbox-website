/**
 * Inline boot script for the welcome scene, run in <head> before first paint.
 * - Shows the scene on the top page unless the URL points somewhere specific (a hash, /business, legal
 *   pages), once per tab session, and never when the visitor prefers reduced motion. Works in embedded
 *   or sandboxed previews too: if session storage is unavailable it simply plays once per page load.
 * - Owns the lifecycle so the scene can never block the site: it closes itself after
 *   AUTO_MS (a CSS fade ends just before, in case the door reveal never runs), on "スキップ", or on Escape, even if the robot script
 *   fails to load. While open, the page underneath is inert.
 * The robot script only adds the robot's acting and can replay the scene from the footer link.
 */
export const WELCOME_BOOT = `(function(){
var d=document.documentElement,K='wbWelcomeShown',AUTO_MS=4300,timer=0,closed=true;
function setInert(on){var g=document.getElementById('wb-welcome');if(!document.body)return;[].forEach.call(document.body.children,function(el){if(el===g||el.tagName==='SCRIPT')return;if(on)el.setAttribute('inert','');else el.removeAttribute('inert')})}
function close(){if(closed)return;closed=true;clearTimeout(timer);var g=document.getElementById('wb-welcome');var had=g&&g.contains(document.activeElement);d.removeAttribute('data-welcome');setInert(false);if(had){var t=document.getElementById('hero-title')||document.querySelector('main h1');if(t){if(!t.hasAttribute('tabindex'))t.setAttribute('tabindex','-1');t.focus({preventScroll:true})}}}
function open(){closed=false;d.setAttribute('data-welcome','show');if(document.body)setInert(true);clearTimeout(timer);timer=setTimeout(close,AUTO_MS);window.__wbWelcome.t0=Date.now()}
window.__wbWelcome={open:open,close:close,isOpen:function(){return!closed},t0:0};
document.addEventListener('DOMContentLoaded',function(){if(!closed)setInert(true)});
document.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest('[data-welcome-skip]');if(t)close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
try{
var p=location.pathname,h=location.hash;
var top=!/^\\/(business|tokusho|terms|privacy)(\\/|$)/.test(p)&&(!h||h==='#top');
var force=/[?&]welcome=1(&|$)/.test(location.search);
var rm=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
var seen=false;try{seen=!!sessionStorage.getItem(K)}catch(e){}
if(rm||!(force||(top&&!seen)))return;
try{sessionStorage.setItem(K,'1')}catch(e){}
open();
}catch(e){close()}
})();`;
