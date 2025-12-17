# Caption Preview Images

This directory contains preview images for caption styles.

## Required Images

Based on the uploaded images, save them with these exact filenames:

1. **mrbeast.png** - Green "CLIPPED" text with outline (from Image 1)
2. **highlight.png** - Pink "Clipping with AI" text with background box (from Image 2)  
3. **neon.png** - Green outlined "CLIPPING WITH AI" text (from Image 3)

## Image Specifications

- Format: PNG
- Aspect Ratio: 16:9 (video aspect ratio)
- Recommended Size: 1280x720px or 1920x1080px
- Background: Transparent or with video context

## Adding New Styles

To add preview images for other caption styles:

1. Create a PNG file named after the style ID (e.g., `subtitle.png`, `podcast.png`)
2. Place it in this directory
3. The modal will automatically load it when that style is selected
4. If an image is missing, it will fallback to `mrbeast.png`

## Current Style Mappings

The following styles use these preview images:

- **mrbeast** → mrbeast.png
- **highlight** → highlight.png
- **neon** → neon.png
- **minimal** → mrbeast.png (fallback)
- **subtitle** → highlight.png (fallback)
- **podcast** → neon.png (fallback)
- **documentary** → highlight.png (fallback)
- **hormozi** → mrbeast.png (fallback)
- **karaoke** → neon.png (fallback)
- **typewriter** → mrbeast.png (fallback)
- **bold** → mrbeast.png (fallback)
- **cinematic** → highlight.png (fallback)
- **popline** → neon.png (fallback)

Update `apps/web/components/captions/CaptionStyleSelector.tsx` to map new styles to their preview images.
