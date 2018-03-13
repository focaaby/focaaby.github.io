+++
author = "Jerry Wang"
categories = ["css"]
date = "2017-10-16"
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "CSS Tricks(2) - 3 kinds of border"
type = "post"

+++

# 使用情境

* navbar 的 hover 效果
* 在 banner titile 字體的設計
* table 中客製化 border

# 解法

## 方法 1

直觀想法，直接 `border-bottom` 加上去。

<p data-height="265" data-theme-id="0" data-slug-hash="xXyzWR" data-default-tab="css,result" data-user="focaaby" data-embed-version="2" data-pen-title="border bottom(1)" class="codepen">See the Pen <a href="https://codepen.io/focaaby/pen/xXyzWR/">border bottom(1)</a> by Jerry Wang (<a href="https://codepen.io/focaaby">@focaaby</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## 方法 2

由於方法 1 不能「在不影響原內容 `padding`, `margin`」來調整 border 的長度及 box 距離。

利用 `position` 先將父元素 `<h1>` 設定為 `relative`， `::after` 設定為 `absolute` 再透過 `left`, `bottom` 設定相對位置。

<p data-height="265" data-theme-id="0" data-slug-hash="veVrrp" data-default-tab="css,result" data-user="focaaby" data-embed-version="2" data-pen-title="border bottom(2)" class="codepen">See the Pen <a href="https://codepen.io/focaaby/pen/veVrrp/">border bottom(2)</a> by Jerry Wang (<a href="https://codepen.io/focaaby">@focaaby</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## 組合技

`border-bottom` 幫 `td` 上底線，用 `::before` 客製化兩兩 `td` 中間的線匡。

<p data-height="265" data-theme-id="0" data-slug-hash="xXyaKy" data-default-tab="css,result" data-user="focaaby" data-embed-version="2" data-pen-title="border bottom(3)" class="codepen">See the Pen <a href="https://codepen.io/focaaby/pen/xXyaKy/">border bottom(3)</a> by Jerry Wang (<a href="https://codepen.io/focaaby">@focaaby</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>