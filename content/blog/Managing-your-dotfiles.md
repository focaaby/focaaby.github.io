+++
author = "Jerry Wang"
categories = ["dotfiles", "bash", "zsh"]
date = "2017-06-27"
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Manageing your dotfiles with git"
type = "post"

+++

## 前言

由於學校計畫或是作業情況不同，經常使用非常多的語言環境，經常會讓自己 OS 處於小宇宙爆炸的情況。先前（其實是很久以前了 QQ）整理的 [vimrc](https://github.com/focaaby/vimrc) 可以在重灌系統的時候快速建立 vim plugin 及習慣設定。現在是該好好整理可以同時兼容 `macOS` 或 `Linux` 環境。

## 何謂 Dotfiles

在家目錄 `ls -al` 查看所有檔案，可以發現許多 `.` 以點開頭的檔案，在 Unix-like 系統中，這些以點開頭的檔案都為隱藏檔，主要功能為環境中的相關設定。

{{< img-post path="date" file="home.png" alt="home-ls-al￼"  >}}

- `.bash_profile` or `.profile`
    在 Bash shell 環境中，是家目錄裡第一個被讀取的檔案，在這檔案通常裡都會去檢查你的當前 shell 並去執行（或是 `source`）：

    dbash
    # if running bash
        if [ -n "$BASH_VERSION" ]; then
            # include .bashrc if it exists
            if [ -f "$HOME/.bashrc" ]; then
                . "$HOME/.bashrc"
            fi
        fi
    d

- `.bashrc` or `.zshrc`
  根據你所使用的 shell 環境則會有不同的相關設定， macOS 及 Linux 環境中基本上都是使用 Bash shell，預設 `.bashrc` 會設定基本的顏色、alias 等，而我自己則是習慣使用 Z Shell 搭配 [Oh My Zsh](https://github.com/robbyrussell/oh-my-zsh)。

## 歸類

根據功能可分成：
- shell：設定 zsh plugin 為主。
- alias：可以將稍微較長的慣用指令，設定成較短的指令。如：`alias l="ls -la"`。
- tool：如 screen、tmux 設定。
- init：撰寫初始化 OS 的 shell script。

# Reference

1. [dotfiles.github.io](https://dotfiles.github.io/)
1. [awesome-dotfiles](https://github.com/webpro/awesome-dotfiles)
1. [mathiasbynens/dotfiles](https://github.com/mathiasbynens/dotfiles)
1. [Getting Started With Dotfiles](https://medium.com/@webprolific/getting-started-with-dotfiles-43c3602fd789)
