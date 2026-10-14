// Both modes process the image locally in this cancellable worker.
self.onmessage=async({data})=>{
  const progress=p=>{
    if(p.status==='progress')self.postMessage({type:'progress',text:`Downloading ${p.file}: ${Math.round(p.progress||0)}% · Your photo stays on this device.`});
  };
  try{
    let text;
    if(data.mode==='quick'){
      const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
      env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
      const describe=await pipeline('image-to-text','Xenova/vit-gpt2-image-captioning',{quantized:true,progress_callback:progress});
      self.postMessage({type:'progress',text:'Writing a short description on this device…'});
      text=(await describe(data.url,{max_new_tokens:64}))[0]?.generated_text;
    }else{
      const {Florence2ForConditionalGeneration,AutoProcessor,AutoTokenizer,RawImage,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
      env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
      let adapter=null;
      try{adapter=await navigator.gpu?.requestAdapter();}catch{}
      const gpu=!!adapter,fp16=gpu&&adapter.features.has('shader-f16');
      const id='onnx-community/Florence-2-base-ft';
      const model=await Florence2ForConditionalGeneration.from_pretrained(id,{
        device:gpu?'webgpu':'wasm',
        dtype:{embed_tokens:fp16?'fp16':'fp32',vision_encoder:fp16?'fp16':'fp32',encoder_model:'q4',decoder_model_merged:'q4'},
        progress_callback:progress
      });
      const processor=await AutoProcessor.from_pretrained(id);
      const tokenizer=await AutoTokenizer.from_pretrained(id);
      self.postMessage({type:'progress',text:gpu?'Describing scene details on this device…':'Describing scene details on the CPU. This may take a few minutes…'});
      const image=await RawImage.fromURL(data.url);
      const task='<MORE_DETAILED_CAPTION>';
      const vision=await processor(image);
      const prompt=tokenizer(processor.construct_prompts(task));
      const ids=await model.generate({...vision,...prompt,max_new_tokens:256,num_beams:1,do_sample:false});
      const decoded=tokenizer.batch_decode(ids,{skip_special_tokens:false})[0];
      text=processor.post_process_generation(decoded,task,image.size)[task];
    }
    text=text?.trim();
    if(!text)throw new Error('Empty description');
    self.postMessage({type:'result',text:text.charAt(0).toUpperCase()+text.slice(1)});
  }catch{self.postMessage({type:'error'});}
};
