# Photo Notes

A static Instagram caption builder. Upload a photo locally, edit its metadata and your own caption, then copy the formatted text. No account, backend, API key or build step required.

## Host on GitHub Pages

1. Create a GitHub repository and upload **the contents of this folder** to its root, keeping the `vendor` folder intact. `index.html` must be at the repository root.
2. Open the repository's **Settings → Pages**.
3. Select **Deploy from a branch**, choose `main` and `/ (root)`, and save.
4. Open the Pages URL GitHub provides once deployment finishes.

All paths are relative, so this works both at a custom domain and at `https://USERNAME.github.io/REPOSITORY/`. No secrets belong in this repository. GitHub Pages serves the files over HTTPS, which enables the clipboard button and browser AI worker.

## Use

- Select or drop a JPEG, PNG or WebP under 40 MB. Clicking the image lets you replace it. Existing text is kept; metadata fills only empty fields. Use Reset to start a different post.
- Original JPEGs offer the best EXIF support. Social-media downloads, screenshots and some exports lack metadata. Unsupported/corrupt metadata leaves the form usable.
- Date, camera body, lens, focal length, aperture, shutter speed and ISO fill when available. Embedded IPTC city/state/country can supply location. GPS coordinates are intentionally not read or reverse-geocoded; enter a place name yourself when blank.
- Aperture is rounded to the nearest hundredth (without unnecessary trailing zeros). Shutter fractions use a whole-number denominator; exposures of one second or longer round to whole seconds. The same rounding applies to manually edited values in the preview and copied caption.
- Write your caption. Edit all details and hashtags. Hashtags are only added when you select a common tag or enter one yourself.
- Copy caption copies **text**, not the photograph. Upload the original photo separately in Instagram. Missing fields are omitted, and the preview is exactly what gets copied.
- Alt text is separate from the caption. Copy it into Instagram's alt-text field. Reset clears the photo, details and descriptions and cancels AI.
- Text fields, selected hashtags, unfinished hashtag input, alt text and detail mode save automatically in localStorage for this site in this browser. Refreshing or reopening restores the text, without the photo. Reset clears the saved draft. Browser data deletion or private browsing can remove the saved text; drafts do not sync between devices.

## Optional local AI

Detailed mode uses Transformers.js 3.8.1 and `onnx-community/Florence-2-base-ft` with its MORE_DETAILED_CAPTION task to describe scene elements and composition. It uses WebGPU when available, with a slower CPU fallback. Quick mode retains Transformers.js 2.17.2 and `Xenova/vit-gpt2-image-captioning`. Libraries download from jsDelivr and models from Hugging Face. Your photo is processed locally in a Web Worker, not sent to an inference service. The first use needs internet and downloads several hundred MB; browser caching can speed later use. Network providers receive normal requests for code/model files. Google Fonts also receives font requests; remove the first CSS line to use system fonts only.

AI can be slow or unavailable on memory-constrained devices. Use a current desktop browser. Generation is optional and cancellable; manual alt text always works. Descriptions may miss details or invent objects: review every draft. Download failures show a message without losing your form. The worker uses one WASM thread so GitHub Pages does not need special cross-origin isolation headers.

## Local development

Serve this directory over HTTP, for example `python -m http.server 8000`, then open `http://localhost:8000`. Opening `index.html` through `file://` is not supported for ES modules or workers.

Run formatter checks with Node 20+: `npm test`. No install is needed.

## Dependencies and sources

- Bundled [exifr 7.1.3](https://github.com/MikeKovarik/exifr), MIT license included in `vendor/EXIFR-LICENSE.txt`.
- Optional [Transformers.js](https://huggingface.co/docs/transformers.js/v2.17.2/en/index) and [caption model](https://huggingface.co/Xenova/vit-gpt2-image-captioning), fetched only when generation is requested.

The app does not publish to Instagram or authenticate with it.
