+++
author = "Jerry Wang"
categories = ["latex", "docker"]
date = "2018-05-20"
description = "本篇透過 latex-docker 來進行 latex 編譯"
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Compile Latex in Docker"
type = "post"

+++

# 前言

開始菸酒生的論文時刻，不想要陷入 Office 排版地獄，找到了幾個不錯 Latex 的排版。比較多都是成大模板，也有找到比較早年的台科模板。嘗試後，儘管第一個的模板已經將設定與內容拆的非常乾淨，但是我選擇了第二個，果然還是適合 `Makefile` 來編譯呀～

* [台灣國立成功大學碩博士用畢業論文 LaTex 模版](https://github.com/wengan-li/ncku-thesis-template-latex)
* [NCKU-thesis](https://github.com/lycsjm/nckuthesis)
* [台灣科技大學碩博士論文 Latex 模板](https://code.google.com/archive/p/ntust-thesis/)

# 為什麼不用原生 Texlive

在 Linux 環境上，可以直接透過套件管理來安裝 Texlive 相關來源：

```bash
// Ubuntu/Debian
sudo apt install texlive-full
```

但是於 macOS 上需要安裝 [MacTeX](http://www.tug.org/mactex/)，但是不像 Linux 環境上，相關 TeX 相關套件會自動幫你安裝好，需要逐一安裝。

因此使用 docker 便可以自己選擇套件，也可以跨平台編譯檔案。

# 動手做

本來想要自己來寫一個 Dockerfile，不過 GitHub 上面也有人寫好的 [latex-docker](https://github.com/blang/latex-docker)。

作者也整理好了三個 tag，分別是

> * blang/latex:ubuntu (:latest) - Dockerfile.ubuntu Ubuntu TexLive distribution: Old but stable, most needed package: texlive-full (3.9GB)
> * blang/latex:ctanbasic - Dockerfile.basic CTAN TexLive Scheme-basic: Up-to-date, only basic packages, base for custom builds (500MB)
> * blang/latex:ctanfull - Dockerfile.full CTAN TexLive Scheme-full: Up-to-date, all packages (5.6GB)

以下先以 `ctanfull` 也就是 TexLive 完整套件的來進行示範：

下載編譯指令

```bash
wget https://raw.githubusercontent.com/blang/latex-docker/master/latexdockercmd.sh
chmod +x latexdockercmd.sh
```

並修改 `latexdockercmd.sh` tag 為 `ctanfull`，如下

```sh
#!/bin/sh
IMAGE=blang/latex:ctanfull
exec docker run --rm -i --user="$(id -u):$(id -g)" --net=none -v "$PWD":/data "$IMAGE" "$@"
```

因此我們可直接編譯

```bash
./latexdockercmd.sh /bin/sh -c "make"
```

# 問題

由於論文會使用中文字體，如標楷體，但是問題是在 container 裡面沒有該字體。而我所解決方式就是，將字體檔案也放置於專案目錄底下，再透過 `\fontspec` 設定讀取目錄字體檔案。

```bash
.
├── Makefile
├── README.md
├── backpages                     // 處理參考文獻、附錄、封底
│   ├── appendices
│   ├── my_appendix.tex
│   ├── my_vita.tex
│   └── ntust_backpages.tex
├── chinese_trans.tex
├── code
│   └── logstash.conf
├── common_env.tex
├── example                      // 原作者範例
│   ├── example_body.tex
│   ├── example_fig.bb
│   ├── example_fig.png
│   └── example_prog_list.m
├── figures                      // 附圖
│   ├── dyna_rm.eps
│   ├── infra-picture.png
│   ├── infra.png
│   ├── seq-admin-get-dashboard.png
│   ├── seq-store-data.png
│   ├── syslog.png
│   ├── system-arch.png
│   └── system-phase.png
├── fonts                        // 使用到的字體
│   ├── BiauKai.ttf
│   ├── Times-Bold.ttf
│   ├── Times-BoldItalic.ttf
│   ├── Times-Italic.ttf
│   └── Times.ttf
├── frontpages                   // 封面、摘要、誌謝及圖表目錄等
│   ├── my_ackn.tex
│   ├── my_cabstract.tex
│   ├── my_eabstract.tex
│   ├── my_names.tex
│   ├── my_symbols.tex
│   ├── ntust_frontpages.tex
│   └── ntust_logo.pdf
├── latexdockercmd.sh            // Docker 指令腳本
├── ntust_report.cls
├── reference.bib
├── sections                     // 內文
│   ├── 01.introduction.tex
│   ├── 02.related_work_background.tex
│   ├── 03.system_architecture.tex
│   ├── 04.system_implementation.tex
│   └── conclusion.tex
├── slashbox.sty
├── thesis.tex                   // 主設定及使用套件
└── watermark
    ├── ntust_logo.pdf
    └── ntust_watermark.tex
```

