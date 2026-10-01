import re

with open('update_hutang_sanzaya_01_10_2026.sql', 'r') as f:
    content = f.read()

matches = re.findall(r" total, created_at, updated_at\) VALUES \(.+?, .+?, '.+?', ([0-9.]+),", content)
total = sum(float(x) for x in matches)
print(f'SQL Total: {total}')
