import urllib.request
import re

url = "https://scamdekho.in"
html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', 'ignore')

# Search for any img src or background-image in the hero section
for m in re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html):
    print("IMG:", m)

for m in re.findall(r'url\(["\']?([^"\'\)]+)["\']?\)', html):
    print("CSS URL:", m)
