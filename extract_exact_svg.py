import urllib.request

url = "https://scamdekho.in"
html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', 'ignore')

idx = html.find('sdShieldBody')
print("Found at:", idx)
# Find the start of <svg and end of </svg> around idx
start = html.rfind('<svg', 0, idx)
end = html.find('</svg>', idx) + 6

svg_code = html[start:end]
print("SVG Length:", len(svg_code))
open('frontend/src/components/ScamDekhoHeroVisual.svg', 'w', encoding='utf-8').write(svg_code)
print("Saved exact SVG to frontend/src/components/ScamDekhoHeroVisual.svg!")

# Also look at the container element wrapping this SVG!
c_start = html.rfind('<div data-dc-tpl="89"', 0, start)
c_end = html.find('</div>', end)
print("\nContainer HTML:")
print(html[c_start:end+100])
