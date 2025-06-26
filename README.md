# YouTube 别给我屎

最新版本链接：[main.dist.js](https://github.com/brangpd/youtube-dont-give-me-shit/releases/latest/download/main.dist.js)

众所周知 YouTube 如果知道你是简中用户，就会不停地把各种史喂过来，挺恶心的，这个脚本用于屏蔽这些史。

`sensitive_words_encoded_list.txt` 提供了一个超轻量级的专门针对 YouTube 推送的反华内容的敏感词表（已用 base64 打码），一旦标题匹配直接完全屏蔽。

`channels_hashed_list.txt` 提供了一个频道列表（为了避免刚学会上外网的年轻人误食、避免起到给这些频道引流的反效果，已用 MD5 打码），一旦发现频道名称哈希匹配直接完全屏蔽。
如此一来，提 PR 就比较麻烦，所以暂不接受 PR，有需要再另想办法。

GitHub Action 已打通自动化构建，往仓库中推送 Tag 即可构建出 Release，推送到 main 分支也可自动打 dist。
