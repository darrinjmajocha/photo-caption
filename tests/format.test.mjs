import {test} from 'node:test';
import assert from 'node:assert/strict';
import {captionText,fromMetadata,dateInput,shutter} from '../format.mjs';
test('matches the requested caption layout',()=>assert.equal(captionText({caption:'A beautiful sunset!',location:'Western Pennsylvania',date:'2026-10-12',camera:'Nikon Z6 II',lens:'NIKKOR Z 70–180mm f/2.8',focal:'165mm',aperture:'f/5.6',shutter:'1/125s',iso:'50',hashtags:'#NikonPhotography #NikonZ6II #LandscapePhotography'}),'A beautiful sunset!\n\n📍 Western Pennsylvania\n📅 October 12, 2026\n📷 Nikon Z6 II + NIKKOR Z 70–180mm f/2.8\n⚙️ 165mm | f/5.6 | 1/125s | ISO 50\n\n#NikonPhotography #NikonZ6II #LandscapePhotography'));
test('omits empty fields and avoids dangling separators',()=>{assert.equal(captionText({}), '');assert.equal(captionText({lens:'50mm',iso:'100'}),'📷 50mm\n⚙️ ISO 100');});
test('keeps EXIF calendar date and formats camera metadata',()=>{const f=fromMetadata({Make:'Nikon',Model:'Nikon Z6 II',DateTimeOriginal:'2026:10:12 23:59:59',ExposureTime:.008,FNumber:5.6,FocalLength:165,ISO:50});assert.equal(f.date,'2026-10-12');assert.equal(f.camera,'Nikon Z6 II');assert.equal(f.shutter,'1/125s');assert.equal('hashtags' in f,false);assert.equal(f.location,'');assert.equal(shutter(2.5),'3s');assert.equal(dateInput('bad'),'');});
test('normalizes tags and keeps entered content as text',()=>assert.equal(captionText({caption:'<b>hello</b>',hashtags:'nature, #sunset nature'}),'<b>hello</b>\n\n#nature #sunset'));

test('rounds fractional exposure and aperture metadata',()=>{const f=fromMetadata({ExposureTime:1/124.7,FNumber:5.6789});assert.equal(f.shutter,'1/125s');assert.equal(f.aperture,'f/5.68');assert.equal(shutter(1.6),'2s');assert.equal(shutter(0),'');});
test('rounds manually edited values in copied caption',()=>{assert.equal(captionText({shutter:'1/124.7s',aperture:'f/5.6789'}),'⚙️ f/5.68 | 1/125s');assert.equal(captionText({shutter:'2.6',aperture:'8'}),'⚙️ f/8 | 3s');});

test('credit requires explicit enablement and nonempty text',()=>{
  for(const credit of ['', '   '])assert.equal(captionText({credit,creditEnabled:true}), '');
  assert.equal(captionText({credit:'@username',creditEnabled:false}), '');
  assert.equal(captionText({credit:'@username'}), '');
});
test('credit appears above hashtags without an automatic at sign',()=>{
  assert.equal(captionText({caption:'Sunset',iso:'50',credit:'Jane Doe',creditEnabled:true,hashtags:'landscape'}),'Sunset\n\n⚙️ ISO 50\n\nPhoto Credit: Jane Doe\n\n#landscape');
  assert.equal(captionText({credit:'@username',creditEnabled:true}),'Photo Credit: @username');
});
