#!/bin/bash
# JSX'i önceden derler ve index.html'i günceller
set -e

echo "1. JSX kaynak çıkarılıyor..."
python3 - << 'PYEOF'
with open('index.html.src', 'r', encoding='utf-8') as f:
    content = f.read()
start = content.find('<script type="text/babel">') + len('<script type="text/babel">')
sw_start = content.rfind('<script>\n  if ("serviceWorker"')
end = content.rfind('</script>', 0, sw_start)
with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content[start:end])
print(f"JSX: {len(content[start:end])//1024} KB")
PYEOF

echo "2. Babel ile derleniyor..."
./node_modules/.bin/babel app.jsx -o app.js

echo "3. Terser ile küçültülüyor..."
./node_modules/.bin/terser app.js -o app.min.js --compress --mangle

echo "4. index.html güncelleniyor..."
python3 - << 'PYEOF'
with open('index.html.src', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    '  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"></script>\n', ''
)
babel_start = content.find('<script type="text/babel">')
sw_start = content.rfind('<script>\n  if ("serviceWorker"')
babel_end = content.rfind('</script>', 0, sw_start) + len('</script>')
new_content = content[:babel_start] + '<script src="app.min.js"></script>' + content[babel_end:]
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
print(f"index.html: {len(new_content)//1024} KB")
PYEOF

echo "Tamamlandı."
