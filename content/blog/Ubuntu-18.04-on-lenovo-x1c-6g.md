+++
author = "Jerry Wang"
categories = ["ubuntu", "linux", "x1c"]
date = "2019-01-12"
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Install Ubuntu 18.04 on Lenovo Thinkpad X1 Carbon(6th)"
type = "post"

+++


# 前言

在安裝之前就有聽過身邊朋友的一些慘痛經驗，主要果然還是在 kernel 還沒跟上硬體部分，也找到相關文章 [Ubuntu 18.04 + Lenovo X1 Carbon (6G)](https://medium.com/@hkdb/ubuntu-18-04-on-lenovo-x1-carbon-6g-d99d5667d4d5)。

# 設定過程

在[官方 BIOS Update Utility](https://pcsupport.lenovo.com/tw/zh/products/laptops-and-netbooks/thinkpad-x-series-laptops/thinkpad-x1-carbon-6th-gen-type-20kh-20kg/downloads/ds502281) ，BIOS 1.30 版本就已經修復 S3 State
[New functions or enhancements](https://download.lenovo.com/pccbbs/mobiles/n23uj11w.txt)

> Support Optimized Sleep State for Linux in ThinkPad Setup - Config - Power.
  (Note) "Linux" option is optimized for Linux OS, Windows user must select
         "Windows 10" option.

進入 BIOS 之後，選擇 Config -> Power -> Sleep State -> Linux

{{< img-post path="date" file="0_bios.JPG" alt="0_bios" >}}


{{< img-post path="date" file="1_bios.JPG" alt="1_bios" >}}
