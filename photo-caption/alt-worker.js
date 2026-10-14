// Runs in a separate thread so the editor and reset button stay responsive.
import {pipeline,env} from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
env.allowLocalModels=false;
env.backends.onnx.wasm.numThreads=1;
self.onmessage=async({data})=>{
  try{
    const describe=await pipeline('image-to-text','Xenova/vit-gpt2-image-captioning',{quantized:true,progress_callback:p=>{
      if(p.status==='progress')self.postMessage({type:'progress',text:`Downloading ${p.file}: ${Math.round(p.progress||0)}% · Your photo stays on this device.`});
    }});
    self.postMessage({type:'progress',text:'Describing your photo on this device…'});
    const result=await describe(data.url,{max_new_tokens:64});
    const text=result[0]?.generated_text?.trim();
    if(!text)throw new Error('Empty result');
    self.postMessage({type:'result',text:text.charAt(0).toUpperCase()+text.slice(1)});
  }catch{self.postMessage({type:'error'});}
};
