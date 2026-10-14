export const clean = value => String(value ?? '').trim();
export function dateInput(value) {
  if (typeof value === 'string') return value.match(/^(\d{4})[:\-](\d{2})[:\-](\d{2})/)?.slice(1).join('-') || '';
  if (value instanceof Date && !isNaN(value)) return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;
  return '';
}
export function shutter(value) {
  if (!(value > 0)) return '';
  return value < 1 ? `1/${Math.round(1/value)}s` : `${Number(value.toFixed(3))}s`;
}
export function normalizeTags(value) {
  return [...new Set(clean(value).split(/[\s,]+/).map(t=>t.replace(/^#+/, '')).filter(Boolean))].map(t=>`#${t}`).join(' ');
}
export function captionText(fields) {
  const f=Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,clean(v)]));
  const info=[];
  if(f.location) info.push(`📍 ${f.location}`);
  if(f.date) {const d=new Date(`${f.date}T12:00:00`);if(!isNaN(d)) info.push(`📅 ${d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}`);}
  const gear=[f.camera,f.lens].filter(Boolean).join(' + ');
  if(gear) info.push(`📷 ${gear}`);
  const settings=[f.focal && (/mm$/i.test(f.focal)?f.focal:`${f.focal}mm`), f.aperture && (/^f\//i.test(f.aperture)?f.aperture:`f/${f.aperture}`), f.shutter && (/s$/i.test(f.shutter)?f.shutter:`${f.shutter}s`), f.iso && (/^ISO\b/i.test(f.iso)?f.iso:`ISO ${f.iso}`)].filter(Boolean);
  if(settings.length) info.push(`⚙️ ${settings.join(' | ')}`);
  return [f.caption,info.join('\n'),normalizeTags(f.hashtags)].filter(Boolean).join('\n\n');
}
export function fromMetadata(m={}) {
  const camera=clean(m.Model),make=clean(m.Make);
  const body=camera && make && !camera.toLowerCase().includes(make.toLowerCase()) ? `${make} ${camera}` : camera || make;
  const tag=v=>v.replace(/[^\p{L}\p{N}_]/gu,'');
  return {date:dateInput(m.DateTimeOriginal || m.CreateDate),camera:body,lens:clean(m.LensModel),focal:m.FocalLength>0?`${m.FocalLength}mm`:'',aperture:m.FNumber>0?`f/${m.FNumber}`:'',shutter:shutter(m.ExposureTime),iso:clean(m.ISO),location:[m.City,m.State,m.Country].map(clean).filter(Boolean).join(', '),hashtags:[make && `#${tag(make)}Photography`,body && `#${tag(body)}`].filter(Boolean).join(' ')};
}
