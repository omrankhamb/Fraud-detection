import urllib.request
import re

url = 'https://scamdekho.in'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', 'ignore')

print("Searching for canvas or scripts...")
for m in re.finditer(r'<canvas[^>]*>', html):
    print('CANVAS:', m.group(0))

for s in re.findall(r'<script[^>]*src=["\']([^"\']+)["\']', html):
    print('SCRIPT:', s)

# Search for globe container
for m in re.finditer(r'<div[^>]+id=["\']([^"\']*(?:globe|map|world|radar)[^"\']*)["\']', html, re.I):
    print('DIV ID:', m.group(0))

for m in re.finditer(r'RECENT PATTERN', html):
    print("Found 'RECENT PATTERN' at:", m.start())
    print(html[m.start()-500:m.start()+1500])
