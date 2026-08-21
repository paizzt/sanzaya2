import os

pages_dir = 'c:/xampp/htdocs/sanzaya2/resources/js/Pages'

for root, dirs, files in os.walk(pages_dir):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            
            # 1. Main wrappers
            new_content = new_content.replace(
                'className="flex justify-between items-center mb-6"',
                'className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4"'
            )
            new_content = new_content.replace(
                'className="flex justify-between items-center mb-6 border-b pb-4"',
                'className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 border-b pb-4 gap-4"'
            )
            new_content = new_content.replace(
                'className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm"',
                'className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4"'
            )
            
            # 2. Forms in filters
            new_content = new_content.replace(
                'className="flex space-x-2 w-full max-w-lg"',
                'className="flex flex-col sm:flex-row gap-2 w-full md:max-w-lg"'
            )
            new_content = new_content.replace(
                'className="flex space-x-3 w-full max-w-lg"',
                'className="flex flex-col sm:flex-row gap-3 w-full md:max-w-lg"'
            )
            
            # 3. Inner right button groups
            new_content = new_content.replace(
                'className="flex items-center gap-3"',
                'className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto"'
            )
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print('Updated ' + path.replace(pages_dir, ''))
