import os
import re
import subprocess

with open('channels_hashed_list.txt') as f:
  channels_list = sorted(list(set(f.read().strip().split('\n'))))

with open('sensitive_words_encoded_list.txt') as f:
  sensitive_words_list = sorted(list(set(f.read().strip().split('\n'))))

with open('main.js') as f:
  main_js = f.read()

main_js = main_js.replace('const blockedChannelsList = new Set();', f'const blockedChannelsList = new Set({channels_list});')
main_js = main_js.replace('const sensitiveWordsList = new Set();', f'const sensitiveWordsList = new Set({sensitive_words_list});')

git_last_tag_cmd = ['git', 'describe', '--tags', '--abbrev=0']
git_last_tag_run = subprocess.run(' '.join(git_last_tag_cmd), cwd=os.getcwd(), shell=True, stdout=subprocess.PIPE)
git_last_tag = git_last_tag_run.stdout.decode('utf-8').strip()
ver = git_last_tag.split('-')[0].split('v')[-1]

main_js = main_js.replace('// @version      0.0', f'// @version      {ver}')

with open('main.dist.js', 'w') as f:
  f.write(main_js)
