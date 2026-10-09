import re

with open('src/focus.js', 'r', encoding='utf-8') as f:
    text = f.read()

def repl(m):
    return m.group(1) + '\n    baseColor: "#FFFFFF",'

text = re.sub(r'(name: "[^"]+",)(?!\s*baseColor)', repl, text)

with open('src/focus.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('Added baseColor to all archetypes successfully')
