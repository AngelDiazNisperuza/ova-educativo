"use strict";
// OVA Word Explorers · tercer grado · sin servicios externos
(() => {
  const WORDS = [
    {en:"pencil",es:"lápiz",emoji:"✏️",unit:"school"},
    {en:"book",es:"libro",emoji:"📚",unit:"school"},
    {en:"chair",es:"silla",emoji:"🪑",unit:"school"},
    {en:"desk",es:"escritorio",emoji:"🪑",unit:"school"},
    {en:"ruler",es:"regla",emoji:"📏",unit:"school"},
    {en:"backpack",es:"mochila",emoji:"🎒",unit:"school"},
    {en:"dog",es:"perro",emoji:"🐶",unit:"animals"},
    {en:"cat",es:"gato",emoji:"🐱",unit:"animals"},
    {en:"bird",es:"pájaro",emoji:"🐦",unit:"animals"},
    {en:"fish",es:"pez",emoji:"🐟",unit:"animals"},
    {en:"rabbit",es:"conejo",emoji:"🐰",unit:"animals"},
    {en:"horse",es:"caballo",emoji:"🐴",unit:"animals"},
    {en:"apple",es:"manzana",emoji:"🍎",unit:"food"},
    {en:"banana",es:"banano",emoji:"🍌",unit:"food"},
    {en:"bread",es:"pan",emoji:"🍞",unit:"food"},
    {en:"milk",es:"leche",emoji:"🥛",unit:"food"},
    {en:"rice",es:"arroz",emoji:"🍚",unit:"food"},
    {en:"water",es:"agua",emoji:"💧",unit:"food"}
  ];
  const TOPICS = {
    school:{name:"La escuela",label:"🎒 SCHOOL"},
    animals:{name:"Animales",label:"🐶 ANIMALS"},
    food:{name:"Alimentos",label:"🍎 FOOD"}
  };
  const ACTIVE_KEY="word_explorers_active_v1",HISTORY_KEY="word_explorers_history_v1";
  const $=id=>document.getElementById(id);
  const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const getJson=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
  const setJson=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{ /* almacenamiento no disponible */ }};
  const randomItems=items=>{const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;};
  const niceDate=iso=>{try{return new Date(iso).toLocaleString("es-CO",{dateStyle:"medium",timeStyle:"short"});}catch{return String(iso);}};
  const getWord=en=>WORDS.find(w=>w.en===en);
  let session=getJson(ACTIVE_KEY,null);
  let history=getJson(HISTORY_KEY,[]);
  if(!Array.isArray(history))history=[];
  if(session&&(!Array.isArray(session.questions)||!Array.isArray(session.answers)))session=null;
  let questionIndex=0,showFeedback=false;
  function navigate(view){
    if(!$(view))view="inicio";
    document.querySelectorAll(".view").forEach(el=>el.classList.toggle("active",el.id===view));
    document.querySelectorAll(".nav").forEach(el=>el.classList.toggle("active",el.dataset.nav===view));
    if(view==="aprender")showWords(document.querySelector(".filter.selected")?.dataset.filter||"all");
    if(view==="jugar")showGame();
    if(view==="historial")renderHistory();
    window.scrollTo({top:0,behavior:"instant"});
    if(location.hash!=="#"+view)historyReplaceHash(view);
  }
  function historyReplaceHash(view){try{window.history.replaceState(null,"","#"+view);}catch{}}
  function showWords(filter="all"){
    const selected=WORDS.filter(w=>filter==="all"||w.unit===filter);
    $("words-grid").innerHTML=selected.map(w=>
      '<article class="word-card '+w.unit+'"><div class="word-art" aria-hidden="true">'+w.emoji+'</div><h3 lang="en">'+w.en+'</h3><p>'+w.es+'</p><button type="button" class="speak" data-say="'+w.en+'" aria-label="Escuchar '+w.en+'">🔊 Escuchar</button></article>'
    ).join("");
    document.querySelectorAll(".filter").forEach(b=>{b.classList.toggle("selected",b.dataset.filter===filter);b.setAttribute("aria-pressed",String(b.dataset.filter===filter));});
  }
  function say(word){
    if(!("speechSynthesis" in window)){alert("La pronunciación no está disponible en este navegador. Puedes leer la palabra en pantalla.");return;}
    try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(word);u.lang="en-US";u.rate=.77;u.pitch=1;speechSynthesis.speak(u);}catch{alert("No fue posible reproducir la pronunciación.");}
  }
  function newQuestions(){
    const chosen=Object.keys(TOPICS).flatMap(unit=>randomItems(WORDS.filter(w=>w.unit===unit)).slice(0,4));
    return randomItems(chosen).map(w=>({
      en:w.en,es:w.es,emoji:w.emoji,unit:w.unit,
      options:randomItems([w.en,...randomItems(WORDS.filter(x=>x.unit===w.unit&&x.en!==w.en)).slice(0,3).map(x=>x.en)])
    }));
  }
  function folio(){
    let suffix="";try{const a=new Uint8Array(4);crypto.getRandomValues(a);suffix=[...a].map(x=>x.toString(16).padStart(2,"0")).join("").toUpperCase();}catch{suffix=Math.random().toString(36).slice(2,10).toUpperCase();}
    return "WE-"+new Date().toISOString().slice(0,10).replaceAll("-","")+"-"+suffix;
  }
  function showGame(){
    const done=Boolean(session?.finishedAt);
    $("start-panel").hidden=Boolean(session);
    $("question-panel").hidden=!session||done;
    $("results-panel").hidden=!done;
    if(!session)return;
    if(done){renderResults();return;}
    questionIndex=session.answers.length;
    showFeedback=false;
    if(questionIndex>=session.questions.length){complete();return;}
    renderQuestion();
  }
  function beginGame(e){
    e.preventDefault();
    const student=$("student-name").value.trim().replace(/\s+/g," ");
    const group=$("student-group").value.trim().replace(/\s+/g," ");
    if(student.length<2){$("student-name").setCustomValidity("Escribe tu nombre y apellido.");$("student-name").reportValidity();return;}
    $("student-name").setCustomValidity("");
    session={id:folio(),student:student.slice(0,65),group:group.slice(0,35),startedAt:new Date().toISOString(),finishedAt:null,questions:newQuestions(),answers:[]};
    setJson(ACTIVE_KEY,session);
    showGame();
  }
  function renderQuestion(){
    const q=session.questions[questionIndex],ans=session.answers[questionIndex];
    $("level-name").textContent=TOPICS[q.unit]?.label||"ENGLISH";
    $("question-counter").textContent="Pregunta "+(questionIndex+1)+" de "+session.questions.length;
    $("question-progress").setAttribute("aria-valuenow",String(questionIndex+(showFeedback?1:0)));
    $("progress-fill").style.width=String((questionIndex+(showFeedback?1:0))/session.questions.length*100)+"%";
    $("question-emoji").textContent=q.emoji;
    $("question-prompt").textContent="¿Cómo se dice «"+q.es+"» en inglés?";
    $("options").innerHTML=q.options.map((opt,i)=>{
      const state=showFeedback?(opt===q.en?" correct":opt===ans?.selected?" wrong":""):"";
      return '<button type="button" class="option'+state+'" data-answer="'+opt+'" '+(showFeedback?"disabled":"")+'><span class="letter">'+String.fromCharCode(65+i)+'</span><span lang="en">'+opt+'</span></button>';
    }).join("");
    const feedback=$("feedback");
    feedback.hidden=!showFeedback;
    $("next-question").hidden=!showFeedback;
    $("next-question").textContent=questionIndex===session.questions.length-1?"Ver mi resultado →":"Siguiente pregunta →";
    if(showFeedback){
      const ok=ans.correct;
      feedback.className="feedback "+(ok?"good":"bad");
      feedback.textContent=ok?"¡Muy bien! ✓ "+q.es+" se dice "+q.en+".":"¡Buen intento! La respuesta correcta es "+q.en+".";
    }
  }
  function choose(option){
    if(!session||session.finishedAt||showFeedback||questionIndex!==session.answers.length)return;
    const q=session.questions[questionIndex];
    if(!q||!q.options.includes(option))return;
    session.answers.push({selected:option,correct:option===q.en,answeredAt:new Date().toISOString()});
    setJson(ACTIVE_KEY,session);showFeedback=true;renderQuestion();
    $("next-question").focus();
  }
  function nextQuestion(){
    if(!showFeedback)return;
    showFeedback=false;questionIndex++;
    if(questionIndex>=session.questions.length)complete();else renderQuestion();
  }
  function complete(){
    if(!session)return;
    if(!session.finishedAt)session.finishedAt=new Date().toISOString();
    setJson(ACTIVE_KEY,session);
    if(!history.some(x=>x.id===session.id)){history.unshift(session);history=history.slice(0,40);setJson(HISTORY_KEY,history);}
    $("question-panel").hidden=true;$("start-panel").hidden=true;$("results-panel").hidden=false;
    renderResults();
  }
  function stats(data){
    const correct=data.answers.filter(a=>a.correct).length;
    const total=data.questions.length;
    const percent=Math.round(correct/total*100);
    const level=correct>=10?"¡Excelente trabajo!":correct>=7?"¡Vas por buen camino!":"¡Sigue practicando!";
    return {correct,total,percent,level,points:correct*10};
  }
  function renderResults(){
    const s=stats(session),name=escapeHtml(session.student);
    const message=s.correct>=10?"¡Dominas muchas palabras! Sigue explorando.":s.correct>=7?"¡Gran esfuerzo! Repasa las que te faltaron.":"Vuelve al álbum, escucha y prueba de nuevo. ¡Tú puedes!";
    $("results-panel").innerHTML='<span class="big" aria-hidden="true">'+(s.correct>=10?"🏆":s.correct>=7?"🌟":"💪")+'</span><h2>'+s.level+'</h2><p>'+name+', has terminado tus 12 retos. '+message+'</p><span class="score">'+s.percent+'<small>% de aciertos</small></span><div class="statgrid"><div><strong>'+s.correct+'/'+s.total+'</strong><small>Respuestas correctas</small></div><div><strong>'+s.points+'/120</strong><small>Puntos obtenidos</small></div><div><strong>'+(s.total-s.correct)+'</strong><small>Para repasar</small></div></div><div class="result-actions"><button class="btn purple" type="button" id="download-current">📄 Descargar mi PDF</button><button class="btn soft" type="button" id="restart-game">Volver a jugar ↻</button><button class="btn soft" type="button" data-nav="historial">Ver historial →</button></div><p class="result-id">Código del informe: '+escapeHtml(session.id)+'</p>';
  }
  function restartGame(){
    if(session&&!session.finishedAt&&!confirm("¿Quieres abandonar esta partida y empezar otra?"))return;
    session=null;try{localStorage.removeItem(ACTIVE_KEY);}catch{}
    $("start-panel").hidden=false;$("question-panel").hidden=true;$("results-panel").hidden=true;
    $("student-form").reset();$("student-name").focus();
  }
  function renderHistory(){
    const target=$("history-content");
    if(!history.length){target.innerHTML='<div class="empty"><span>🗂️</span>Aún no hay evaluaciones finalizadas en este dispositivo.<br>Completa un juego para guardar un resultado.</div>';return;}
    target.innerHTML='<div class="tablewrap"><table><thead><tr><th>Estudiante</th><th>Grupo</th><th>Fecha</th><th>Aciertos</th><th>Informe</th></tr></thead><tbody>'+
      history.map(x=>{const s=stats(x);return '<tr><td>'+escapeHtml(x.student)+'</td><td>'+escapeHtml(x.group||"3.º")+'</td><td>'+escapeHtml(niceDate(x.finishedAt))+'</td><td>'+s.correct+'/'+s.total+' ('+s.percent+'%)</td><td><button type="button" data-report="'+escapeHtml(x.id)+'">📄 PDF</button></td></tr>';}).join("")+'</tbody></table></div>';
  }
  function clearHistory(){
    if(!history.length)return;
    if(!confirm("¿Borrar todos los resultados guardados en este dispositivo? Esta acción no se puede deshacer."))return;
    history=[];setJson(HISTORY_KEY,history);renderHistory();
  }
  // Documento PDF A4 en ASCII con codificación WinAnsi. No necesita librerías ni internet.
  function encodePDF(value){
    const overrides={"–":"-","—":"-","‘":"'","’":"'","“":'"',"”":'"',"•":"-","°":"o","€":"EUR"};
    return [...String(value??"")].map(c=>{
      c=overrides[c]??c;
      return [...c].map(v=>{
        const cp=v.charCodeAt(0);
        if(v==="("||v===")"||v==="\\")return "\\"+v;
        if(cp>=32&&cp<=126)return v;
        if(cp>=160&&cp<=255)return "\\"+cp.toString(8).padStart(3,"0");
        return " ";
      }).join("");
    }).join("");
  }
  function createPDF(data){
    const s=stats(data),W=595,H=842;
    const blue=[.13,.2,.42],purple=[.37,.29,.79],gray=[.38,.43,.53],white=[1,1,1],pale=[.96,.95,1],light=[.90,.91,.94],green=[.1,.52,.32],red=[.73,.22,.29];
    const rgb=c=>c.map(n=>n.toFixed(3)).join(" ");
    const pages=[[],[]];
    const rect=(p,x,y,w,h,c)=>pages[p].push(rgb(c)+" rg "+x+" "+(H-y-h)+" "+w+" "+h+" re f");
    const rule=(p,x,y,x2,c=light)=>pages[p].push(rgb(c)+" RG 1 w "+x+" "+(H-y)+" m "+x2+" "+(H-y)+" l S");
    const write=(p,str,x,y,size=11,bold=false,color=blue)=>pages[p].push("BT "+rgb(color)+" rg /F"+(bold?2:1)+" "+size+" Tf 1 0 0 1 "+x+" "+(H-y-size)+" Tm ("+encodePDF(str)+") Tj ET");
    const footer=p=>{rule(p,40,794,555);write(p,"Word Explorers  |  Inglés - Tercer grado",40,803,9,false,gray);write(p,"Página "+(p+1)+" / 2",490,803,9,false,gray);};
    rect(0,0,0,W,132,purple);
    write(0,"WORD EXPLORERS",40,29,12,true,white);
    write(0,"INFORME DE EVALUACIÓN",40,56,22,true,white);
    write(0,"Vocabulario en inglés - Tercer grado",40,94,11,false,white);
    write(0,"DATOS DEL ESTUDIANTE",40,155,12,true,purple);
    rule(0,40,178,555);
    const name=String(data.student||"").slice(0,65);
    write(0,"Nombre:",40,194,10,true,gray);
    write(0,name.slice(0,45),130,192,12,true,blue);
    if(name.length>45)write(0,name.slice(45),130,209,11,false,blue);
    write(0,"Grupo:",40,232,10,true,gray);write(0,String(data.group||"3.er grado").slice(0,55),130,230,11,false,blue);
    write(0,"Finalizado:",40,259,10,true,gray);write(0,niceDate(data.finishedAt),130,257,11,false,blue);
    write(0,"Folio:",40,286,10,true,gray);write(0,data.id,130,284,10,false,blue);
    rect(0,40,330,515,130,pale);
    write(0,"RESULTADO GENERAL",58,347,12,true,purple);
    write(0,String(s.percent)+"%",58,376,41,true,purple);
    write(0,s.level,200,383,16,true,blue);
    write(0,s.correct+" de "+s.total+" respuestas correctas",200,412,12,false,gray);
    write(0,s.points+" de 120 puntos",200,432,11,false,gray);
    write(0,"DESEMPEÑO POR TEMA",40,486,12,true,purple);
    let y=523;
    for(const [unit,t] of Object.entries(TOPICS)){
      const indices=data.questions.map((q,i)=>q.unit===unit?i:-1).filter(i=>i>=0);
      const hits=indices.filter(i=>data.answers[i]?.correct).length;
      write(0,t.name,45,y,12,true,blue);write(0,hits+" / "+indices.length,455,y,12,true,blue);rule(0,45,y+26,550);y+=48;
    }
    rect(0,40,688,515,83,[.99,.97,.91]);
    write(0,"Criterio orientativo:",55,700,11,true,blue);
    write(0,"10 a 12 aciertos: Excelente  |  7 a 9: En progreso",55,723,10,false,gray);
    write(0,"0 a 6 aciertos: Requiere refuerzo",55,741,10,false,gray);
    footer(0);
    rect(1,0,0,W,106,purple);
    write(1,"WORD EXPLORERS",40,25,11,true,white);
    write(1,"DETALLE DE RESPUESTAS",40,49,21,true,white);
    write(1,"Estudiante: "+String(data.student||"").slice(0,55),40,120,11,true,blue);
    write(1,"Folio: "+data.id,40,140,9,false,gray);
    rule(1,40,162,555);
    data.questions.forEach((q,i)=>{
      const ans=data.answers[i]||{selected:"Sin respuesta",correct:false};
      const top=174+i*49;
      if(i%2===0)rect(1,40,top,515,47,[.977,.976,.995]);
      write(1,String(i+1).padStart(2,"0")+". "+q.es+" ("+TOPICS[q.unit].name+")",49,top+4,10,true,blue);
      write(1,"Marcada: "+ans.selected+"     Correcta: "+q.en,65,top+23,10,false,gray);
      write(1,ans.correct?"BIEN":"REVISAR",485,top+8,9,true,ans.correct?green:red);
    });
    write(1,"Puntaje final: "+s.correct+"/"+s.total+"   |   "+s.percent+"%   |   "+s.points+"/120 puntos",40,774,10,true,purple);
    footer(1);
    const objects=[];
    objects[1]="<< /Type /Catalog /Pages 2 0 R >>";
    objects[2]="<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>";
    for(let i=0;i<2;i++)objects[3+i]="<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> /Contents "+(5+i)+" 0 R >>";
    for(let i=0;i<2;i++){const stream=pages[i].join("\n")+"\n";objects[5+i]="<< /Length "+stream.length+" >>\nstream\n"+stream+"endstream";}
    objects[7]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    objects[8]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
    let pdf="%PDF-1.4\n",offsets=[0];
    for(let i=1;i<=8;i++){offsets[i]=pdf.length;pdf+=i+" 0 obj\n"+objects[i]+"\nendobj\n";}
    const xref=pdf.length;pdf+="xref\n0 9\n0000000000 65535 f \n";
    for(let i=1;i<=8;i++)pdf+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
    pdf+="trailer\n<< /Size 9 /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF\n";
    return new Blob([pdf],{type:"application/pdf"});
  }
  function downloadReport(data){
    if(!data||!data.finishedAt){alert("Termina la evaluación antes de descargar el PDF.");return;}
    try{
      const blob=createPDF(data),url=URL.createObjectURL(blob),link=document.createElement("a");
      link.href=url;link.download="resultado_ingles_"+String(data.student).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/gi,"_").replace(/^_|_$/g,"").slice(0,40)+"_"+data.id+".pdf";
      document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    }catch(error){console.error(error);alert("No se pudo generar el PDF. Inténtalo de nuevo.");}
  }
  document.addEventListener("click",e=>{
    const nav=e.target.closest("[data-nav]");if(nav){e.preventDefault();navigate(nav.dataset.nav);return;}
    const filter=e.target.closest("[data-filter]");if(filter){showWords(filter.dataset.filter);return;}
    const speech=e.target.closest("[data-say]");if(speech){say(speech.dataset.say);return;}
    const answer=e.target.closest("[data-answer]");if(answer){choose(answer.dataset.answer);return;}
    const report=e.target.closest("[data-report]");if(report){const data=history.find(x=>x.id===report.dataset.report);if(data)downloadReport(data);return;}
    if(e.target.closest("#download-current"))downloadReport(session);
    if(e.target.closest("#restart-game"))restartGame();
  });
  $("student-form").addEventListener("submit",beginGame);
  $("student-name").addEventListener("input",()=>$("student-name").setCustomValidity(""));
  $("next-question").addEventListener("click",nextQuestion);
  $("clear-history").addEventListener("click",clearHistory);
  $("resume-button").addEventListener("click",showGame);
  if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  showWords();
  navigate(["inicio","aprender","jugar","historial"].includes(location.hash.slice(1))?location.hash.slice(1):"inicio");
})();