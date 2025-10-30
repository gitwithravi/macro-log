# PWA Icons Required

To complete the PWA setup, you need to add app icons to this directory.

## Required Icon Files

The following icon files are referenced in `/public/manifest.json`:

- `icon-192x192.png` - 192x192 pixels
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels

## How to Create Icons

### Option 1: Use a Logo/Design Tool

1. Create or use an existing logo
2. Export as PNG at the required sizes
3. Name them exactly as listed above
4. Place in the `/public` directory

### Option 2: Use Online PWA Icon Generators

Free tools that can generate all sizes from one image:

- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

### Option 3: Use a Placeholder

For development/testing, you can use a simple colored square:

```bash
# Using ImageMagick (if installed)
convert -size 192x192 xc:#4f46e5 icon-192x192.png
convert -size 384x384 xc:#4f46e5 icon-384x384.png
convert -size 512x512 xc:#4f46e5 icon-512x512.png
```

## Design Guidelines

- **Simple & Recognizable**: Icon should work at small sizes
- **Solid Background**: Avoid transparency for best results
- **Consistent Branding**: Match your app's color scheme (Indigo #4f46e5)
- **Safe Zone**: Keep important elements in the center 80% of the icon

## Icon Recommendations

For Macro Journal, consider:
- Food-related iconography (fork & knife, plate, apple, etc.)
- Letter "M" in a styled format
- Combination of food + tracking/chart elements
- Abstract shapes representing nutrition/health

## After Adding Icons

1. Test PWA installation on mobile
2. Check how icons appear on:
   - Home screen
   - App switcher
   - Splash screen
3. Update `manifest.json` if you use different filenames

---

**Note**: The app will work without these icons, but they're essential for a polished PWA experience!
