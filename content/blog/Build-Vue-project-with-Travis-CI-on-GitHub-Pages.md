+++
author = "Jerry Wang"
categories = ["github", "vue", "travis-ci"]
date = "2017-12-21"
description = "Travis.ci 主要於 GitHub 上時常使用到的持續整合工具，也支援了非常多程式語言，如 Node.js, PHP, Java, C, Golang…等。這次 slide project 透過 vue-cli 了一個小專案，但是每次都必須手動 push 至 GitHub Pages 覺得有點小困擾，本篇透過 Travis 支援 Open Source 專案方式，設置自動部屬於到專案頁面上。"
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Build Vue project with Travis CI on GitHub Pages"
type = "post"

+++

# 前言

[Travis.ci](https://travis-ci.org/) 主要於 [GitHub](https://github.com/) 上時常使用到的持續整合工具，也支援了非常多程式語言，如 Node.js, PHP, Java, C, Golang...等。這次 slide project 透過 [vue-cli](https://github.com/vuejs/vue-cli) 了一個小專案，但是每次都必須手動 push 至 GitHub Pages 覺得有點小困擾，本篇透過 Travis 支援 Open Source 專案方式，設置自動部屬於到專案頁面上。



# 建立專案



##  vue-cli

建立 vue 專案，使用的是 webpack 設定檔

```bash
vue init webpack ebook-search
```



## GitHub 設定 Personal access tokens

因為必須透過第三方授權讓 Travis 上傳更新 repo，所以必須到設定裡面的 **Developer settings** > **Personal access tokens** 新增一個應用程式。

* 取得後的 token 切記保密，請勿上傳至公開頁面，如果有洩漏後，可以至設定頁面重新產一組新的 token。

{{< img-post path="date" file="00-Github-personal-access-token.png" alt="00-Github-personal-access-token￼"  >}}


## 設定 Travis Dashboard

到 https://travis-ci.org/ ，可以透過 Github 帳號登入並啟用專案

* [Travis CI .org](https://travis-ci.org/auth) 公開專案
* [Travis CI .com](https://travis-ci.com/auth) 私人專案

{{< img-post path="date" file="01-select-project.png" alt="01-select-project￼"  >}}

筆者這邊設定只有`.travis.yaml`才會自動啟用，並在環境變數（Environment Variables）加入一個環境變數 `GITHUB_TOKEN` 儲存剛剛取得的  **Personal access tokens** 避免於 token 洩漏。

{{< img-post path="date" file="02-active-project.png" alt="02-active-project￼"  >}}

## Travis 設定檔

語言採用 `node_js`，安裝步驟主要也只有 `npm run build` 。

```yaml
language: node_js

node_js:
  - "8"

install:
  - npm install
  - npm run build
```

翻閱了一下文件，發現 Travis 已經支援自動部屬於 GitHub Pages。

```yaml
deploy:
  # 將要上傳的目錄設定為 build 完之後的目錄
  local_dir: ./dist
  provider: pages
  skip_cleanup: true
  github_token: $GITHUB_TOKEN # Set in travis-ci.org dashboard
  on:
    branch: master
```



## 注意

原先預設的 `vue-cli` `config/index.js`裡面有設定 `assetsPublicPath` 需要改成

```js
assetsPublicPath: './',
```

因為部屬於 Github Pages，我們所使用的檔案是在當前目錄底下的 `static`，而非根目錄底下的檔案，需要使用相對目錄才能讀取。



# 小結

原先以為如果要自動 commit 至另外的 branch 會很複雜，需要重新 clone , push 等過程。看起來  Travis 已經越來越方便，並能支援更多的腳本進行整合，也有看到文件可提供 `osx` 環境進行測試，讚讚！



# 參考連結

1. [Building a JavaScript and Node.js project](https://docs.travis-ci.com/user/languages/javascript-with-nodejs/)
2. [GitHub Pages Deployment](https://docs.travis-ci.com/user/deployment/pages/)



