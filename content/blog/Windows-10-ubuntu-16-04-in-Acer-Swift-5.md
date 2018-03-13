+++
author = "Jerry Wang"
categories = ["windows", "ubuntu", "uefi", "dualboot"]
date = "2017-05-09"
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Windows 10 + ubuntu 16.04 in Acer Swift 5"
type = "post"

+++


# 前言

最近幫家人買了一台筆電，Acer Swift 5，型號是 SF514-51-50YK 基本上主打輕薄而且規格 i5 第七代的 CPU，512 SSD，CP 值滿高的
由於老哥多半使用 R language 來進行一些資料分析，需要雙系統，於是乎有了一連串的 debug time

## Step 1

首先進入 BIOS 設定 Boot Mode， Windows 會提醒你「在 windows 8 或較新的版本都已經使用 UEFT 模式，請勿更動。」，接下來關閉 Secure Boot。

## Step 2

由於原先是整顆硬碟為 windows 10，將硬碟壓縮看要分割多少空間給 Ubuntu，我這邊規劃為 100 GB windows 10，剩下空間都給 Ubuntu。

分割好之後，再來處理的是 windows 8 之後出現的「快速啟動」。
如果 windows 的「快速啟動」功能是開啟的時候，會導致無法進入 Ubuntu 的開機程式 grub。

「快速啟動」的位置於：
-> 開啟控制台
-> 電源選項
-> 選擇按下按鈕時的行為
-> 變更無法使用的設定
-> **取消勾選** 開啟快速啟動（建議選項）
-> 儲存變更

## Step 3

筆者這邊預先已經先安裝 Ubuntu live USB 了，我們可以直接進行安裝動作。

理論上，Ubuntu 的 grub 都會幫你重新整理好開機選單，便能選擇所使用 OS，但往往在這一步驟中總會有些小驚喜，畢竟是 Windows（？

上網查了許多資料，整理歸納如以下解法：

1. 進入 BIOS，如果開機順序中可以選擇 Ubuntu 則調整順序為第一開機優先。若無選單可以選擇，則進行第二種解法。
2. 開機進入 Windows 之後，使用 **管理者權限** 開啟命令提示字元，輸入 `bcdedit /set {bootmgr} path \EFI\ubuntu\grubx64.efi` 將 Windows 原先開機程式替換成 Ubuntu 的 grub 位置。

## 解決方案

開機後，進入還原模式看到以下畫面後，點選命令提示字元並輸入上方第二點的方式則可以解決問題

{{< img-post path="date" file="cmd.jpg" alt="cmd￼"  >}}

## 後記

漂亮的 Acer Swift 5，看的我也好想買新筆電了 XD

{{< img-post path="date" file="swift5.jpg" alt="Swift5"  >}}