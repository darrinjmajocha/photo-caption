import {captionText,fromMetadata} from './format.mjs';
const $=id=>document.getElementById(id);
const fields=['caption','location','date','camera','lens','focal','aperture','shutter','iso','hashtags'];
let photoURL='',revision=0,worker=null,toastTimer;
const aiHint='Optional on-device AI. First use downloads several hundred MB and may take a few minutes. Review the result before using it.';
function update(){const text=captionText(Object.fromEntries(fields.map(k=>[k,$(k).value])));$('preview').value=text;$('count').textContent=`${Array.from(text).length.toLocaleString()} characters`;$('copy').disabled=!text;$('copy-alt').disabled=!$('alt').value.trim();}
function toast(text){$('toast').textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').textContent='',5000);}
function stopAI(){worker?.terminate();worker=null;$('generate').disabled=!photoURL;$('cancel-ai').hidden=true;}
function clear(){revision++;stopAI();if(photoURL)URL.revokeObjectURL(photoURL);photoURL='';$('details').reset();$('alt').value='';$('file').value='';$('photo').removeAttribute('src');$('photo').hidden=true;$('upload-prompt').hidden=false;$('filename').textContent='No photo selected';$('dimensions').textContent='';$('metadata-status').textContent='Original camera files work best. Exported images may have fewer details.';$('ai-status').textContent=aiHint;$('generate').disabled=true;update();}
async function load(file){
  if(!file)return;
  if(!/\.(jpe?g|png|webp)$/i.test(file.name)||file.size>40*1024*1024){toast('Choose a JPEG, PNG or WebP under 40 MB.');return;}
  clear();const token=revision;
  const url=URL.createObjectURL(file);photoURL=url;
  $('filename').textContent=file.name;$('metadata-status').textContent='Reading photo details…';
  const img=new Image();img.src=url;
  try{await img.decode();}catch{if(token===revision){clear();toast('This image could not be opened. Try exporting it as a JPEG.');}return;}
  if(token!==revision)return;
  $('photo').src=url;$('photo').hidden=false;$('upload-prompt').hidden=true;$('dimensions').textContent=`${img.naturalWidth} × ${img.naturalHeight}`;$('generate').disabled=false;
  const initial=Object.fromEntries(fields.map(k=>[k,$(k).value]));
  try{
    const metadata=await window.exifr.parse(file,{tiff:true,exif:true,iptc:true,gps:false,translateValues:true,reviveValues:false,pick:['Make','Model','LensModel','FocalLength','FNumber','ExposureTime','ISO','DateTimeOriginal','CreateDate','City','State','Country']});
    if(token!==revision)return;
    const values=fromMetadata(metadata||{});let count=0;
    for(const [key,value]of Object.entries(values)){if(value&&$(key).value===initial[key]){$(key).value=value;count++;}}
    $('metadata-status').textContent=count?`${count} fields filled from photo metadata. Review and edit any detail below.`:'No usable camera metadata found. You can fill in the details below.';
  }catch{if(token===revision)$('metadata-status').textContent='Could not read this photo’s metadata. You can still enter everything manually.';}
  update();
}
$('details').addEventListener('submit',e=>e.preventDefault());$('details').addEventListener('input',update);$('alt').addEventListener('input',update);$('file').addEventListener('change',e=>load(e.target.files[0]));$('reset').addEventListener('click',()=>{clear();toast('Ready for your next photo.');});
for(const type of ['dragenter','dragover'])$('dropzone').addEventListener(type,e=>{e.preventDefault();$('dropzone').classList.add('drag');});
for(const type of ['dragleave','drop'])$('dropzone').addEventListener(type,e=>{e.preventDefault();$('dropzone').classList.remove('drag');});
$('dropzone').addEventListener('drop',e=>load(e.dataTransfer.files[0]));
async function copy(id){const el=$(id);try{await navigator.clipboard.writeText(el.value);toast(id==='alt'?'Alt text copied.':'Caption copied.');}catch{el.focus();el.select();toast('Text selected. Press Ctrl+C (or Command+C) to copy.');}}
$('copy').addEventListener('click',()=>copy('preview'));$('copy-alt').addEventListener('click',()=>copy('alt'));
$('cancel-ai').addEventListener('click',()=>{stopAI();$('ai-status').textContent='Generation cancelled. You can write your own description or try again.';});
$('generate').addEventListener('click',()=>{
  if(!photoURL)return;stopAI();$('generate').disabled=true;$('cancel-ai').hidden=false;$('ai-status').textContent='Loading the on-device model. The first download can take a few minutes…';
  const startingText=$('alt').value;
  try{worker=new Worker(new URL('./alt-worker.js',import.meta.url),{type:'module'});
    worker.onmessage=({data})=>{if(data.type==='progress')$('ai-status').textContent=data.text;
      else if(data.type==='result'){if($('alt').value===startingText){$('alt').value=data.text;$('ai-status').textContent='Draft generated locally. Check the subject and details, then edit before copying.';}else{$('ai-status').textContent=`You edited your description while AI ran. Suggested draft: ${data.text}`;}stopAI();update();}
      else if(data.type==='error')fail();};
    worker.onerror=fail;worker.postMessage({url:photoURL});
  }catch{fail();}
});
function fail(){stopAI();$('ai-status').textContent='AI could not run here. Try a current desktop browser with an internet connection, or enter alt text manually.';}
update();
