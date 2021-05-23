+++
author = "Jerry Wang"
categories = ["wordpress", "nginx"]
date = "2019-03-03"
description = ""
featured = "本文介紹如何調教 Wordpress on Nginx 設定"
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "WordPress Tuning"
type = "post"

+++

## 前言

以前在兼差幫忙管理系所網站時，那時候學校主流 [CMS](https://en.wikipedia.org/wiki/Content_management_system ) 使用的是 Joomla，當年也從 apache2 移轉使用 nginx 做了些微的調教，但是也沒有認真做個筆記。剛好公司的官網也要從 windows 移轉到 linux 伺服器上，不過使用的是 WordPress，也稍微 survey 了相關調教，本篇為移轉過程及相關調教筆記。

## 安裝與移轉

使用伺服器架構為基本的 LNMP，可以參考 [DigitalOcean - How To Install Linux, Nginx, MySQL, PHP (LEMP stack) in Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-linux-nginx-mysql-php-lemp-stack-in-ubuntu-16-04)，額外安裝的 php 套件有 `php7.0-curl`、`php7.0-zip`。

```bash
apt install php7.0-curl php7.0-zip
```

比較麻煩的點在於 windows 換行符號為 `^M` ，因此必須把每個檔案的換行符號切換成 linux 的換行符號。

```bash
# 替換換行符號
find . -type f -exec dot2unix {} \;
# 確保資料夾及檔案權限
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
```

## Nginx 設定

### gzip 及 cache

```nginx

# gzip
gzip on;
gzip_static on;
gzip_disable "msie6";

gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_buffers 16 8k;
gzip_http_version 1.1;
# Don't compress files smaller than 256 bytes, as size reduction will be negligible.
gzip_min_length 256;
gzip_types
    application/atom+xml
    application/javascript
    application/json
    application/ld+json
    application/manifest+json
    application/rss+xml
    application/vnd.geo+json
    application/vnd.ms-fontobject
    application/x-font-ttf
    application/x-web-app-manifest+json
    application/xhtml+xml
    application/xml
    font/opentype
    image/bmp
    image/svg+xml
    image/x-icon
    text/cache-manifest
    text/css
    text/plain
    text/vcard
    text/vnd.rim.location.xloc
    text/vtt
    text/x-component
    text/x-cross-domain-policy;

# cache
open_file_cache max=100000 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 2;
open_file_cache_errors on;
```

### 網站設定

參考官網 [Wordpress for Nginx config](https://codex.wordpress.org/Nginx)

- General WordPress rules：一般 WordPress 及 php 相關設定。
- Global restrictions file：不該開放權限給人存取相關設定。

## Tuning

### Nginx 網站設定

* 盡可能的 cache 一些靜態檔案。

```nginx
location ~* \.(ogg|ogv|svg|svgz|eot|otf|woff|mp4|ttf|css|rss|atom|js|jpg|jpeg|gif|png|ico|zip|tgz|gz|rar|bz2|doc|xls|exe|ppt|tar|mid|midi|wav|bmp|rtf)$ {
    expires max;
    log_not_found off;
    access_log off;
}
```

* HTTP2 設定。

### WordPress Plugin

* [WP Super Cache](https://wordpress.org/plugins/wp-super-cache/)： WordPress 仰賴的是 php 動態存取資料庫產生出對應的 HTML 頁面呈現，Super Cache 功能先把一些常用的網頁先產出成 Static HTML 檔案暫存起來，讓使用者存取時可以直接存取。依照官網教學安裝方式即可。
* [Fast Velocity Minify](https://wordpress.org/plugins/fast-velocity-minify/)：把散落各個 plugin 的 css, js merge 並 minify，同時也有將 WordPress 版本號的檔案也一併整理壓縮達到隱藏版本號的效果。
* [WP SMush](https://wordpress.org/plugins/wp-smushit/)：壓縮上傳的 image，免費版則是每次幫你壓縮 50 張圖片，每次都得自己重複點擊壓縮。
* [All in One SEO](https://tw.wordpress.org/plugins/all-in-one-seo-pack/)：在我接收以前就已經設定好了，但是也幫助了網站 SEO 評分，每個頁面也都可以設定對應 SEO tag 及 Sitemap 自動產出，大幅提高了網站被搜尋到的排名。

## 安全性

### Nginx

```nginx
location ~* ^/wp-content/uploads/.*.(html|htm|shtml|php|js|swf)$ {
    deny all;
}

location ~ /(wp-config|xmlrpc).php$ {
    deny all;
}

location ~ /\.ht {
    deny all;
}

# 只允許 localhost 可以登入及查看 admin 後台
location ~ /(wp-admin|wp-login\.php)$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/run/php/php7.0-fpm.sock;
    allow 127.0.0.1;
    deny  all;
}
```

### SSL

參考 [Cipherli.st - Strong Ciphers for Apache, nginx and Lighttpd](https://cipherli.st/)。

 WordPress、Joomla 相關套件大量使用了 iFrame 遷入在 plugin 設定，因此以下這個設定可以看有沒有影響操作斟酌加入設定檔。
```
add_header X-Frame-Options DENY;
```

## 測效網站

* [GTMetrix](https://gtmetrix.com/)：提供 PageSpeed 和 YSlow 個項目評分，可以查看有哪些可能可以改善的圖片壓縮，或是伺服器沒有設定 cache 等驗證。
* [Lighthouse](https://developers.google.com/web/tools/lighthouse/)： Google Opensource 的自動化工具，但是滿多都以非常「嚴格」的標準來查看網頁存取速度，也提供了 Progressive Web App 的檢驗。

## 相關連結

* [DigitalOcean - How To Install Linux, Nginx, MySQL, PHP (LEMP stack) in Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-linux-nginx-mysql-php-lemp-stack-in-ubuntu-16-04)
* [Wordpress for Nginx config](https://codex.wordpress.org/Nginx)
* [9 Tips for Improving WordPress Performance](https://www.nginx.com/blog/9-tips-for-improving-wordpress-performance-with-nginx/)
* WordPress Plugins
    * [WP Super Cache](https://wordpress.org/plugins/wp-super-cache/)
    * [Fast Velocity Minify](https://wordpress.org/plugins/fast-velocity-minify/)
    * [WP SMush](https://wordpress.org/plugins/wp-smushit/)
    * [All in One SEO](https://tw.wordpress.org/plugins/all-in-one-seo-pack/)
* [Cipherli.st - Strong Ciphers for Apache, nginx and Lighttpd](https://cipherli.st/)
