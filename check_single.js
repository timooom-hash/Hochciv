/* prüft die Einzeldatei in jsdom: lädt, startet ein Spiel mit beiden Erweiterungen */
const fs=require('fs'), {JSDOM}=require('jsdom');
const html=fs.readFileSync('hochzeivilization-einzeldatei.html','utf8');
const errs=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,
  beforeParse(w){
    w.SVGElement.prototype.createSVGPoint=function(){return {x:0,y:0,matrixTransform(){return{x:0,y:0}}}};
    w.SVGElement.prototype.getScreenCTM=function(){return {a:1,inverse(){return this}}};
    w.HTMLElement.prototype.setPointerCapture=function(){};
    w.onerror=e=>errs.push(e);
  }});
const w=dom.window, $=id=>w.document.getElementById(id);
w.eval("show('screen-setup'); setupScreen();");
$('setup-events').checked=true; $('setup-events').onchange();
$('setup-wonders').checked=true;
$('setup-go').onclick();
const S=w.eval('S');
const fields=$('map').querySelectorAll('[data-r]').length;
console.log('Karte:', S.map.rows.length+'x'+S.map.rows[0].length, '|', fields, 'Felder');
console.log('Erweiterungen:', 'Ereignisse='+(S.ev?S.ev.mode:'aus'), 'Wunder='+S.wo);
console.log('Techs im Bogen:', (w.eval("$('a-tech').onclick(); $('ov-body').querySelectorAll('.tech').length")));
console.log('Fehler:', errs.length ? errs : 'keine');
process.exit(errs.length?1:0);
