import re

with open('satw6559_sanzaya (1).sql', 'r', encoding='utf-8') as f:
    in_roles = False
    for line in f:
        if 'INSERT INTO `roles`' in line:
            in_roles = True
            print(line.strip())
        elif in_roles:
            print(line.strip())
            if ';' in line:
                in_roles = False
                break
