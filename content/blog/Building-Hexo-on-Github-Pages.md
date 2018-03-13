+++
author = "Jerry Wang"
categories = ["nodejs", "github", "hexo"]
date = "2017-05-11"
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Building Hexo on Github Pages"
type = "post"

+++

# 前言

其實這篇教學應該要比先前兩篇早時間出來，才不會導致不小心誤用 `hexo deploy` 導致原先在 Github 的 source 直接被覆蓋 QQ

## Hexo 簡介

在 Github Pages 原生支援 [Jekyll](https://jekyllrb.com/) 靜態頁面當作你的首頁或是部落格，而 [Hexo](https://hexo.io) 也是一個支援 Markdown 格式且一鍵部屬產生靜態網站的框架，底層架構則是使用 Nodejs，最最最重要的是，作者還是台灣人唷！！

## Hexo 安裝 && 套用 Theme

在首頁就可以看到基本的安裝指令如下：

```=bash
npm install hexo-cli -g
hexo init blog
cd blog
npm install
hexo server
```

在這邊我選擇的主題是 [Hacker](https://github.com/CodeDaraW/Hacker)，在這邊先將全域設定檔 `_config.yml` 修改主題

```
theme: Hacker
```

接著，將 Hacker 主題 clone 或是直接 download 至 `themes` 路徑，並設定主題設定檔 `_config.yml`
筆者在這邊已經先申請好 [Disqus](https://disqus.com/) 當作留言回覆，以及 [Google Analytics](https://www.google.com/analytics/) ID 了

```=yaml
# duoshuo comment
duoshuo: false
duoshuo_name:

# disqus comment
disqus: true
disqus_shortname:

# google analytics
googleTrackId:
```

## Hexo 指令 && 資產資料夾

### 新增文章

這裡 layout 預設有 `draft`，`page`，`post`三種，可自行新增 layout

```=bash
hexo new [layout] <title>
```

### 資產資料夾

由於筆者會附上一些操作的截圖，Hexo 這邊提供了相關套件可以使用 `hexo-asset-image`

```=bash
npm install hexo-asset-image // or yarn add hexo-asset-image
```

安裝完套件以後，可以在全域設定檔 `_config.yml` 修改資產設定：

```=yaml
post_asset_folder: true
```
設定完之後，在每次新增文章時，每一個文章名稱都會有一個同樣命名的資料夾路徑，便可以將該文章需要放置的 image、css、js 等檔案放置該目錄。

```
├── Windows-10-ubuntu-16-04-in-Acer-Swift-5
│   ├── cmd.jpg
│   └── swift5.jpg
└── Windows-10-ubuntu-16-04-in-Acer-Swift-5.md
```

## Hexo 部屬

在這個步驟中有一些觀念要先釐清：

1. 在 GitHub Pages 中，若是以個人帳號為主的部落格，則必須使用 branch 為 `master` 來放置你的靜態網頁內容。也就是說你需要額外多開一個 branch 來放置 Hexo source 。
1. `hexo-deployer-git` 套件的運作方式，會先產生 `.deploy_git` 的路徑並 `force pushing` [註 3] 到設定檔對應的 branch 上面，若是沒有 `.deploy_git` 的話則會將該 branch 重新初始（`git init`）。

在撰寫此篇之前，我並未充分理解運作原理，錯誤將 source push 到 master 當作備份，同時也將部屬 branch 設定韋 master，於是造成了原先 source 被覆蓋的悲劇...

## 後記

好險當初~~耍笨~~時資料是在研究室 PC ，另外有備份存放於筆電，只需要將 Markdown 重新撰寫一下即可。
Git 真的不要隨便用 `force` 呀... 真的是會後悔的 QQ


## Reference

1. [Hexo 官網及文件](https://hexo.io)
1. [hexo-deployer-git 運作模式](https://github.com/hexojs/hexo-deployer-git#how-it-works)
1. [強制更新遠端分支](https://zlargon.gitbooks.io/git-tutorial/content/remote/force_update.html)