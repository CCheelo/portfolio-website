"""Point every page's canonical and Open Graph URLs at a new site address.

Usage (from portfolio-website/):
    python scripts/set-site-url.py https://www.choolwecheelo.com

The current address is read from index.html's <link rel="canonical">, so the
script can be run again whenever the domain changes. Only absolute URLs that
start with the old address are touched; relative links are left alone.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def main():
    if len(sys.argv) != 2 or not sys.argv[1].startswith('http'):
        sys.exit(__doc__)
    new = sys.argv[1].rstrip('/') + '/'
    index = (ROOT / 'index.html').read_text(encoding='utf-8')
    match = re.search(r'<link rel="canonical" href="([^"]+)"', index)
    if not match:
        sys.exit('No canonical link found in index.html')
    old = match.group(1)
    if old == new:
        print('Already set to', new)
        return

    changed = 0
    for page in ROOT.rglob('*.html'):
        text = page.read_text(encoding='utf-8')
        if old in text:
            page.write_text(text.replace(old, new), encoding='utf-8', newline='')
            changed += 1
    print(f'{old} -> {new} in {changed} files')


if __name__ == '__main__':
    main()
