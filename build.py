import re

with open('channels_list.txt') as f:
  channels_list = list(set(f.read().strip().split('\n')))

with open('sensitive_words_encoded_list.txt') as f:
  sensitive_words_list = list(set(f.read().strip().split('\n')))

with open('main.js') as f:
  main_js = f.read()

main_js = main_js.replace('const blockedChannelsList = new Set();', f'const blockedChannelsList = new Set({channels_list});')
main_js = main_js.replace('const sensitiveWordsList = new Set();', f'const sensitiveWordsList = new Set({sensitive_words_list});')

with open('main.dist.js', 'w') as f:
  f.write(main_js)
