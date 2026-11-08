# Finding pictures and clips

## Sources, in order of preference
1. **Art Institute of Chicago** (`api.artic.edu`): public-domain paintings, prints, sculpture and
   photographs (CC0). Great for emotion: faces, waves, storms, figures.
2. **Wikimedia Commons**: old masters, classical busts (Socrates), anatomy books (Vesalius, Gray's).
   Most old works are public domain. **Check each licence**: CC BY or BY-SA files need a credit line.
3. **NASA** (`images-api.nasa.gov`): space, Earth, sunrise from orbit. Public domain.
4. **Pixabay** (`pixabay.com/api/` and `/api/videos/`): modern photos and **moving clips**. Free under
   the Pixabay Content License, with no credit needed. The key is in the environment variable
   `PIXABAY_API_KEY`. Never print it.
   - A valid key looks like `12345678-` followed by about 25 letters and numbers.
   - If Pixabay says "Invalid API key", the owner fixes it in the environment settings, never in chat.

Skip AI-generated stock (Pixabay tags include "ai generated"), famous film clips, logos, recognisable
living celebrities, and anything with a watermark.

## Network quirks (learned the hard way)
- Wikimedia needs a descriptive User-Agent with a contact URL, e.g.
  `chills-video-research/1.0 (https://github.com/ayanrindeisraeloluwabusayo-prog/website)`.
  Without one it answers 429.
  - Go slowly: about 1.5 s between requests.
  - Use standard thumbnail widths (330, 500, 1280 px) on `upload.wikimedia.org`.
    `thumb.wikimedia.org` is blocked here.
- The Art Institute's image server refuses that long User-Agent. Send a plain honest one
  (`chills-video-research/1.0`). Never pretend to be a web browser.
  - Image URL: `https://www.artic.edu/iiif/2/<image_id>/full/843,/0/default.jpg`.
- Pixabay photo download links (`largeImageURL`) expire after a while, so download soon after searching.

## Workflow
1. Write the search plan as JSON, with one entry per scene and queries per source. See the
   `search_media.py` docstring for the format. Search for the **feeling**, not just the literal word:
   "wave crashing", "storm clouds", "diver slow motion", "eyes closed music".
2. `python3 scripts/search_media.py plan.json results.json` searches all sources.
3. `python3 scripts/grid.py results.json <scene> <outdir>` builds numbered thumbnail sheets. Look at
   every sheet, and note the 3-4 best per picture slot with a one-line reason.
4. Show the owner a contact sheet: an HTML page with the picks, reasons, licences (green = public domain
   or Pixabay, orange = credit needed) and source links. Send it with SendUserFile.
5. Download the chosen files at full size. Crop clips to vertical:
   `ffmpeg -ss <start> -t <secs> -i in.mp4 -an -vf "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920,fps=30" -c:v libx264 -crf 20 -pix_fmt yuv420p public/media/<name>.mp4`
   Move the crop's x offset to keep the subject in frame.
