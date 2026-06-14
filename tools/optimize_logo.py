from PIL import Image
import os
import json

input_path = 'public/images/logo.png'
output_dir = 'public/images/logos'

os.makedirs(output_dir, exist_ok=True)

img = Image.open(input_path)
print(f"Original: {img.size[0]}×{img.size[1]}, {os.path.getsize(input_path)/1024:.2f} KB")

sizes = {
    'logo-full.png': (1200, 656),      # Full size variant
    'logo-sm.png': (400, 219),         # Small (navbar)
    'logo-md.png': (600, 328),         # Medium
    'logo-icon.png': (64, 64),         # Icon/favicon size
}

# Save PNG variants
for name, size in sizes.items():
    resized = img.resize(size, Image.Resampling.LANCZOS)
    path = os.path.join(output_dir, name)
    resized.save(path, 'PNG', optimize=True)
    sz = os.path.getsize(path) / 1024
    print(f"{name}: {size[0]}×{size[1]}, {sz:.2f} KB")

# Save WebP (modern format for better compression)
for name, size in list(sizes.items())[:2]:  # WebP for full and medium
    resized = img.resize(size, Image.Resampling.LANCZOS)
    webp_name = name.replace('.png', '.webp')
    path = os.path.join(output_dir, webp_name)
    resized.save(path, 'WEBP', quality=85)
    sz = os.path.getsize(path) / 1024
    print(f"{webp_name}: {sz:.2f} KB")

# Also save optimized version of original
img.save(os.path.join(output_dir, 'logo-original.png'), 'PNG', optimize=True)
sz = os.path.getsize(os.path.join(output_dir, 'logo-original.png')) / 1024
print(f"logo-original.png: {img.size[0]}×{img.size[1]}, {sz:.2f} KB")

print("\n✓ Logos optimized and saved to public/images/logos/")
