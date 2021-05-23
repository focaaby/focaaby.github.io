+++
author = "Jerry Wang"
categories = ["css"]
date = "2017-10-16"
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "CSS Tricks(1) - pseudo css elements after and before"
type = "post"

+++

## 前言

最近接了一個 case 主要後台使用 [ePage](http://www.epage.ndhu.edu.tw/bin/home.php)。稍微翻了一些資料，主要時空背景還是在十年前的時候，儘管可以自訂公告、相簿等模組，但是許多預設的 DOM 物件都無法做修改， 必須透過 CSS 方式去強制修改一些位置，因此也學習到了不少東西，預計會分好幾篇來紀錄。

## 使用情境

在許多「連結」前面，多數為了要講究美或整齊，多半都會加入一些小 icon 來提醒使用者來快速找到對應的連結，在能自己修改 html 的情況下，都會加入類似 [Font Awesome](http://fontawesome.io/) `<i class="menu-item-icon fa fa-fw fa-archive"></i>` 寫法，本篇使用了 pseudo element 方式實作。

## pseudo - before & after

在 CSS pseudo element 中最常使用到的 `::after` 及 `::before`，允許你在該 DOM 物件裡加入一些內容，像是字串、圖片等。

### 加入字串

<p data-height="244" data-theme-id="0" data-slug-hash="veVeeW" data-default-tab="css,result" data-user="focaaby" data-embed-version="2" data-pen-title="pseudo - before & after(1)" class="codepen">See the Pen <a href="https://codepen.io/focaaby/pen/veVeeW/">pseudo - before & after(1)</a> by Jerry Wang (<a href="https://codepen.io/focaaby">@focaaby</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 加入圖片

<p data-height="265" data-theme-id="0" data-slug-hash="MEPErg" data-default-tab="css,result" data-user="focaaby" data-embed-version="2" data-pen-title="pseudo - before & after(2)" class="codepen">See the Pen <a href="https://codepen.io/focaaby/pen/MEPErg/">pseudo - before & after(2)</a> by Jerry Wang (<a href="https://codepen.io/focaaby">@focaaby</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## 問題

在圖片的範例中，將 pseudo content 設定為該圖片來源，意思是圖片來源有多大，網頁顯示也就多大，導致無法客製化我們的圖片大小。

### 解決方法

在 after, before 的 content 中也能設定 `backgound`，代表可以將背景圖片設定為我們想要的 icon，並將該圖示顯示滿版來調整大小即可。

首先先將 display 改成 `inline-block`，然後 content 的 url 改為 `background-image` 方式，並且將`background-size` 設定為 `contain` 達成整個 block 滿版，最後再利用 `width`, `height` 就可以調整大小了。

<p data-height="265" data-theme-id="0" data-slug-hash="oGaGPG" data-default-tab="css,result" data-user="focaaby" data-embed-version="2" data-pen-title="pseudo - before & after(3)" class="codepen">See the Pen <a href="https://codepen.io/focaaby/pen/oGaGPG/">pseudo - before & after(3)</a> by Jerry Wang (<a href="https://codepen.io/focaaby">@focaaby</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Reference

1. [CSS-Tricks: After-and-before](https://css-tricks.com/almanac/selectors/a/after-and-before/)
