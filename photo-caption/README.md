# Photo Notes

A static Instagram caption builder. Upload a photo locally, edit its metadata and your own caption, then copy the formatted text. No account, backend, API key or build step required.

## Host on GitHub Pages

1. Create a GitHub repository and upload **the contents of this folder** to its root, keeping the `vendor` folder intact. `index.html` must be at the repository root.
2. Open the repository's **Settings → Pages**.
3. Select **Deploy from a branch**, choose `main` and `/ (root)`, and save.
4. Open the Pages URL GitHub provides once deployment finishes.

All paths are relative, so this works both at a custom domain and at `https://USERNAME.github.io/REPOSITORY/`. No secrets belong in this repository. GitHub Pages serves the files over HTTPS, which enables the clipboard button and browser AI worker.

## Use

- Select or drop a JPEG, PNG or WebP under 40 MB. Clicking the image lets you replace it; replacing it clears the previous post.
- Original JPEGs offer the best EXIF support. Social-media downloads, screenshots and some exports lack metadata. Unsupported/corrupt metadata leaves the form usable.
- Date, camera body, lens, focal length, aperture, shutter speed and ISO fill when available. Embedded IPTC city/state/country can supply location. GPS coordinates are intentionally not read or reverse-geocoded; enter a place name yourself when blank.
- Write your caption. Edit all details and hashtags. Camera hashtags are suggested from make/model; subject hashtags are manual.
- Copy caption copies **text**, not the photograph. Upload the original photo separately in Instagram. Missing fields are omitted, and the preview is exactly what gets copied.
- Alt text is separate from the caption. Copy it into Instagram's alt-text field. Reset clears the photo, details and descriptions and cancels AI.
- Nothing is persisted by this app. Refreshing or closing clears the current post.

## Optional local AI

Generate alt text downloads Transformers.js 2.17.2 from jsDelivr and the quantized `Xenova/vit-gpt2-image-captioning` model from Hugging Face. Your photo is processed locally in a Web Worker, not sent to an inference service. The first use needs internet and downloads several hundred MB; browser caching can speed later use. Network providers receive normal requests for code/model files. Google Fonts also receives font requests; remove the first CSS line to use system fonts only.

AI can be slow or unavailable on memory-constrained devices. Use a current desktop browser. Generation is optional and cancellable; manual alt text always works. Descriptions may miss details or invent objects: review every draft. Download failures show a message without losing your form. The worker uses one WASM thread so GitHub Pages does not need special cross-origin isolation headers.

## Local development

Serve this directory over HTTP, for example `python -m http.server 8000`, then open `http://localhost:8000`. Opening `index.html` through `file://` is not supported for ES modules or workers.

Run formatter checks with Node 20+: `npm test`. No install is needed.

## Dependencies and sources

- Bundled [exifr 7.1.3](https://github.com/MikeKovarik/exifr), MIT license included in `vendor/EXIFR-LICENSE.txt`.
- Optional [Transformers.js](https://huggingface.co/docs/transformers.js/v2.17.2/en/index) and [caption model](https://huggingface.co/Xenova/vit-gpt2-image-captioning), fetched only when generation is requested.

The app does not publish to Instagram or authenticate with it.
