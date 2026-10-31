import urllib.request
import re

url = 'https://scamdekho.in'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', 'ignore')

start = html.find('data-dc-tpl="89"')
end = html.find('</section>', start)
with open('scamdekho_hero_extracted.html', 'w', encoding='utf-8') as f:
    f.write(html[start-50:end])
print('Saved scamdekho_hero_extracted.html, size:', len(html[start-50:end]))


print('\n--- ALL CSS LINKED ---')
css_files = re.findall(r'href="([^"]+\.css[^"]*)"', html)
for c in css_files:
    print('CSS:', c)

# Let's search inside the HTML for <style> tags containing keyframes
styles = re.findall(r'<style[^>]*>(.*?)</style>', html, re.DOTALL)
for s in styles:
    if 'sd-' in s or 'Shield' in s or 'Lock' in s or 'hero' in s:
        print('STYLE BLOCK MATCH:')
        for line in s.split('\n'):
            if any(k in line for k in ['@keyframes', 'sd-', 'Tilt', 'Halo', 'Sway', 'Lock', 'Shield']):
                print(line)
