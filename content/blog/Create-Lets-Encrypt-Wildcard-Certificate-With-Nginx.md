+++
author = "Jerry Wang"
categories = ["letsencrypt", "certbot", "bind"]
date = "2018-03-25"
description = "本文介紹如何利用 certbot 建立 Let's Encrypt Wildcard Certificate"
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Create Let's Encrypt Wildcard Certificate With BIND"
type = "post"
+++

## 前言

[去年暑假](https://letsencrypt.org/2017/07/06/wildcard-certificates-coming-jan-2018.html) Let's Encrypt 公告了 2018 年將會提供 Wildcard Certificate，不過有一些些的小遲到了會～本篇將會介紹如何利用 `certbot` 來申請 Let's Encrypt Wildcard Certificate。

## 動手做

在開始之前先確定 `certbot` 版本，Wildcard 功能是在 0.22 之後才能使用的

```bash
certbot --version
certbot 0.22.2
```

### 指令

```bash
sudo certbot certonly --manual -d *.example.com --agree-tos --manual-public-ip-logging-ok --preferred-challenges dns-01 --server https://acme-v02.api.letsencrypt.org/directory
```

輸入你的信箱

```bash
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator manual, Installer None
Enter email address (used for urgent renewal and security notices) (Enter 'c' to
cancel): example@gmail.com
```

修改 DNS 伺服器設定 TXT 紀錄

```bash
-------------------------------------------------------------------------------
Please deploy a DNS TXT record under the name
_acme-challenge.example.com with the following value:

BOqn-vN6icpDeCpVoHirabJ72ctuOrEbAUKy3EE_XcE

Before continuing, verify the record is deployed.
```

筆者這邊是自己的 DNS server（`bind`），在設定檔加入

```
_acme-challenge         IN      TXT     "BOqn-vN6icpDeCpVoHirabJ72ctuOrEbAUKy3EE_XcE"
```

利用 `nslookup` 檢查 DNS 設定，確認後按下 `Enter` 繼續下一步驟

```bash
$ nslookup -q=TXT _acme-challenge.example.com

Server:		192.168.123.1
Address:	192.168.123.1#53

Non-authoritative answer:
_acme-challenge.example.com	text = "BOqn-vN6icpDeCpVoHirabJ72ctuOrEbAUKy3EE_XcE"
```

```bash
-------------------------------------------------------------------------------
Press Enter to Continue
Waiting for verification...
Cleaning up challenges

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/example.com/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/example.com/privkey.pem
   Your cert will expire on 2018-06-23. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le

```

Nginx 網站設定檔

```nginx
server {
    if ($host = www.example.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot
    listen 80;
    listen [::]:80;
    server_name www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name www.example.com;
    server_name_in_redirect off;

    access_log /var/log/nginx/example_com.access_log;
    error_log /var/log/nginx/example_com.error_log info;

    root /var/www/example_com;
    index index.html index.htm default.html default.htm;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

}
```

## 參考來源

1. https://letsencrypt.org/2017/07/06/wildcard-certificates-coming-jan-2018.html
1. http://forum.centos-webpanel.com/dns/bind-dns-record-examples/
1. https://sinkcup.github.io/letsencrypt-wildcard-certificate
