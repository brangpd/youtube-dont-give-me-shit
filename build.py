import re

with open('channels_list.txt') as f:
  channels_list = list(set(f.read().strip().split('\n')))

with open('main.js') as f:
  main_js = f.read()

# Replace `const blockedChannelsList = [];` with the read list
main_js = re.sub(r'const blockedChannelsList = new Set\(\);', f'const blockedChannelsList = new Set({channels_list});', main_js)

with open('main.dist.js', 'w') as f:
  f.write(main_js)
