#!/usr/bin/env python3
"""Prüft bei einem Pull Request, dass APP_VERSION höher ist als auf dem Ziel-Branch (keine doppelte Versionsnummer).
Aufruf: python3 tools/check-version.py [Ziel-Ref, Standard origin/main]
Nur relevant, wenn index.html geändert wurde; sonst wird nichts verlangt."""
import re, subprocess, sys
base = sys.argv[1] if len(sys.argv) > 1 else 'origin/main'
def ver(text):
    m = re.search(r"APP_VERSION\s*=\s*'([^']+)'", text)
    return m.group(1) if m else None
def key(v):
    return tuple(int(x) for x in re.findall(r'\d+', v))
head = open('index.html', encoding='utf8').read()
try:
    old = subprocess.run(['git', 'show', base + ':index.html'], capture_output=True, text=True, check=True).stdout
except subprocess.CalledProcessError:
    sys.exit('Ziel-Branch ' + base + ' nicht gefunden (git fetch origin main?)')
if old == head:
    print('index.html unverändert – keine neue Version nötig'); sys.exit(0)
v_head, v_base = ver(head), ver(old)
print('APP_VERSION: PR', v_head, '| ' + base, v_base)
if not v_head or (v_base and key(v_head) <= key(v_base)):
    print('::error::APP_VERSION muss höher sein als auf ' + base + ' (' + str(v_base) + '). '
          'Vermutlich wurde main inzwischen weiterentwickelt: Branch auf main bringen, Version erhöhen, '
          'Änderungslog-Eintrag anpassen, python3 tools/finalize.py.')
    sys.exit(1)
print('ok')
