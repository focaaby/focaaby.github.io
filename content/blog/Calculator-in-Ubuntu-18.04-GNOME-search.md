+++
author = "Jerry Wang"
categories = ["ubuntu", "linux", "GNOME"]
date = "2019-01-12"
description = "本文介紹如何在 Ubuntu 18.04 dash 直接使用計算機預覽"
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Calculator in Ubuntu 18.04 GNOME search"
type = "post"

+++

# 前言

看到 gslin 大大的[直接在-ubuntu-的-unity-上直接計算](https://blog.gslin.org/archives/2018/12/17/8638/%E7%9B%B4%E6%8E%A5%E5%9C%A8-ubuntu-%E7%9A%84-unity-%E4%B8%8A%E7%9B%B4%E6%8E%A5%E8%A8%88%E7%AE%97/)，後來想到 Ubuntu 18.04 應該也要有這功能才對，於是就找了一下。

# 過程

在 18.04 desktop 預設是用 GNOME 作為 GUI 介面，並使用了 Snap 安裝預設套件，
包含了 `GNOME` 及 `計算機` 等相關套件。

{{< img-post path="date" file="snap-list.png" alt="snap-list￼" >}}

但是透過 snap 安裝的一些套件，缺少了一些功能。

```bash
// 移除透過 snap 安裝 calculator 並重新透過 apt 重新安裝
sudo snap remove gnome-calculator
sudo apt install gnome-calculator
```

可以在 dash 計算了～

{{< img-post path="date" file="calculator-in-dash.png" alt="calculator-in-dash￼" >}}

# 相關連結

* [built-in-calculator-to-gnome-search-window](https://askubuntu.com/questions/1062973/built-in-calculator-to-gnome-search-window)
