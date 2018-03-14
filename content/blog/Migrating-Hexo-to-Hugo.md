+++
author = "Jerry Wang"
categories = ["hexo", "hugo"]
date = "2018-03-13"
description = "本文利用 Hugo 建立靜態網站，並簡易比較 Hexo 與 Hugo 的差異。"
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Migrating Hexo to Hugo"
type = "post"

+++

# 前言

由於 Hexo 多少在部屬時會發生不可預期的錯誤，相關模組有些也逐漸停止更新，除了最近也開始研究 golang 之外，也發現 Hugo 在 GitHub 星星數竟然已經超越 Hexo 了，因此來試試號稱世界最快的靜態網頁生產框架。

# 動手做


## 安裝 Hugo

由於 Hugo 是由 golang 編譯而成，因此我們只需要安裝編譯好的 binaray 檔案，這邊為了未來升級方便，皆使用套件管理進行安裝。

```bash
brew install hugo // macOS
snap install hugo // Ubuntu or apt install hugo
```

## 建立新的網站

```bash
hugo install site blog //資料夾名稱為 blog
cd blog
git init
git submodule add https://github.com/jpescador/hugo-future-imperfect.git themes/hugo-future-imperfect // 可以選擇自己喜歡的主題
```

# 主題

筆者原先想說說不定也有人移植 [Hexo Next](https://github.com/iissnan/hexo-theme-next) 主題，不過沒關係官網也有整理彙整主題頁面 [Hugo Theme](https://themes.gohugo.io/)
選用 [hugo-future-imperfect](https://github.com/jpescador/hugo-future-imperfect)，主要原因是此主題有優化滿多 SEO 的部份，圖片管理及社群分享都比較符合筆者的期許。


主題說明可以知道目錄結構如下，複製 `theme/hugo-future-imperfect/exampleSite` 即可，不過筆者不會使用到 `staticman` 因此沒有複製 `staticman.yml` 設定檔。

```bash
// 主題目錄結構
exampleSite
├── config.toml
├── staticman.yml
├── content
|   ├── about
|   |   └── _index.md
|   ├── blog
|   │   ├── creating-a-new-theme.md
|   │   ├── goisforlovers.md
|   │   ├── hugoisforlovers.md
|   │   └── migrate-from-jekyll.md
|   ├── contact
|   │   └── _index.md
|   └── itemized
|       ├── item1.md
|       ├── item2.md
|       ├── item3.md
|       └── item4.md
├── data
│   └── comments
│       └── .gitkeep
└── static
    ├── css
    │   └── add-on.css
    ├── img
    |   ├── 2014
    |   |   ├── 04
    |   |   |   ├── pic02.jpg
    |   |   |   └── pic03.jpg
    |   |   └── 09
    |   |       └── pic01.jpg
    |   └── main
    |       └── logo.jpg
    └── js
        └── add-on.js
```

## 內容

Hexo 通用格式

```markdown
---
title:
tags:
date:
---
```

Hugo 主題 Markdown，多了客製化 SEO 及呈現每篇文章內容部份

```markdown
+++
author = "Jerry Wang"
categories = [""]
date = "2018-03-13"
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Migrating Hexo to Hugo"
type = "post"

+++
```

因此需要將每篇除了內容之外，其餘 metadata 都需要更新。

# Disqus 移轉

Disqus 主控台提供 `Migration Tools`，筆者選擇 `Upload a URL map`，下方說明有一範例： `http://example.com/old-path/old/post.html > http://example.com/new-path/new/post.html`

{{< img-post path="date" file="disqus-migrate.png" alt="disqus-migrate"  >}}

所有文章中有被回應的是 [Acer Switf 5 安裝雙系統](https://focaaby.github.io/blog/windows-10-ubuntu-16-04-in-acer-swift-5/)（~~趁機廣告~~），提供的 csv 檔案如

```csv
https://focaaby.github.io/2017/05/09/Windows-10-ubuntu-16-04-in-Acer-Swift-5/, https://focaaby.github.io/blog/windows-10-ubuntu-16-04-in-acer-swift-5/
```

最後上傳至 Disqus 主控台就完成囉～


# 簡易比較

## 速度

Hugo 原生提供了 benchmark 功能進行測試建立靜態網站的時間。

```
$ hugo benchmark

Started building sites ...
Started building sites ...
Started building sites ...
Started building sites ...
Started building sites ...
Started building sites ...
Started building sites ...
Started building sites ...
Started building sites ...
Started building sites ...
Started building sites ...
Started building sites ...
Started building sites ...

Average time per operation: 92ms
Average memory allocated per operation: 31823kB
Average allocations per operation: 650581
```

Hexo 筆者測試 10 次，平均時間約 2.55s，顯著的 Hugo 92ms 大勝。

## 其他

Hugo 提供更多 template 的寫法，在搜尋比較主題時，現在多數的 Hugo 主題都具有 SEO 的設定，且擁有 `[params.intro]` 語法直接從 `config.toml` 設定頁面上的 sidebar 或是 navbar。

# 結語

Hugo 提供了許多更客製化語法結構，讓主題開發者有更彈性設定，不論產生網頁速度及操作都有更好的發展，也難怪從 GitHub 星星數竄起速度發現於靜態網頁框架中的新星之秀。而 Hugo 官網也提供許多移轉的工具，不過還沒有 Hexo 轉 Hugo 的工具，猜測是 Hugo 主題在寫 Markdown 每個主題由使用者輸入的欄位不一致，也並無一個比較妥當方式來做移轉，筆者文章數少還能用複製修改方式，應該會有好一陣子不會移轉框架，Hugo 也還在 0.37 版本，期望未來支援更多部屬方式！


# 參考連結

1. [Hugo 簡易教學](https://gohugo.io/getting-started/quick-start/)
1. [Hugo Theme](https://themes.gohugo.io/)