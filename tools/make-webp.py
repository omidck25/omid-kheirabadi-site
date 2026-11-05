"""Make the WebP copies the site serves, next to each original photo.

For every .jpg/.jpeg/.png under assets/images it writes:
  NN.webp      the full photo (long side capped at 1600px)
  NN-720.webp  720px wide
  NN-480.webp  480px wide
(a photo narrower than that keeps its own width in the small copy, so
every photo has all three names; the homepage script relies on that)
The originals stay as they are: link previews (og:image) and search
engines still use the JPGs. GIFs are left alone (they're animated).

Run from the site folder after adding photos:  python tools/make-webp.py
Files that are already newer than their original are skipped.
"""
import os
import sys
from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'images')
FULL_MAX = 1600
VARIANTS = [720, 480]
QUALITY = 82


def save(img, path, src_mtime):
    if os.path.exists(path) and os.path.getmtime(path) >= src_mtime:
        return False
    img.save(path, 'WEBP', quality=QUALITY, method=6)
    return True


def convert(src):
    stem = os.path.splitext(src)[0]
    mtime = os.path.getmtime(src)
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
        if max(im.size) > FULL_MAX:
            im.thumbnail((FULL_MAX, FULL_MAX), Image.LANCZOS)
        made = save(im, stem + '.webp', mtime)
        for width in VARIANTS:
            w = min(width, im.width)
            small = im if w == im.width else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            made = save(small, '%s-%d.webp' % (stem, width), mtime) or made
    return made


def main():
    count = 0
    for folder, _, files in os.walk(ROOT):
        for name in sorted(files):
            if name.lower().endswith(('.jpg', '.jpeg', '.png')):
                count += convert(os.path.join(folder, name))
    print('converted %d photos' % count)


if __name__ == '__main__':
    sys.exit(main())
