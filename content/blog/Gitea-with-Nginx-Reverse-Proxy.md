+++
author = "Jerry Wang"
categories = ["gitea", "nginx", "letsencrypt", "docker"]
date = "2017-10-22"
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Gitea with Nginx Reverse Proxy"
type = "post"

+++

# 前言

先前在 DevOps Taipei 2017 有注意到有前輩在推廣 Gitea，因為個人也有些私人需求而來研究一下如何架設。

本篇可知道：

* 如何用 Docker 架設 Gitea server
* 利用 Nginx docker 設定 reverse proxy
* Let's Encrypt 綁定 reverse proxy

# 開始安裝

## Gitea

建立一個目錄儲存 Git 資料

```bash
sudo mkdir -p /var/lib/gitea
```

由於稍後會用 Ngnix docker 實作 reverse proxy，這邊先開始撰寫 `docker-compose`

```yaml
version: "3"
services:
  gitea:
    image: gitea/gitea:latest
    ports:
      - "10022:22"
      - "10080:3000"
    volumes:
      - /var/lib/gitea:/data
    container_name: gitea
```

`docker-compose up -d` 將 Gitea container 啟用後，瀏覽器開啟 http://hostname:10080 可以看到以下設定頁面

{{< img-post path="date" file="gitea-install.png" alt="gitea-install￼￼￼"  >}}

主要看使用者習慣來選擇 DB，及 domain name 等，如果往後需要變更設定也可以修改此檔案 `/var/lib/gitea/gitea/conf/app.ini`

## Nginx Reverse Proxy

新增一資料夾 `nginx`，主要放置 nginx 設定檔、virtual host 設定及 snippets。

```bash
mkdir nginx
mkdir nginx/conf.d      // site setting
mkdir nginx/snippets
```

新增 `gitea.conf` 至 `nginx/conf.d`，這邊要注意到 `gitea:3000`，主要藉由 docker compose 啟動時，會先將 container service 綁定到同一個 bridge networking 上。倘若 service 名稱有修改，對應名稱也必須修正。

```nginx
upstream YOUR.DOMAIN {
    server gitea:3000;
}

server {
    listen      80;
    listen [::]:80;
    server_name  YOUR.DOMAIN;

    location / {
        proxy_pass http://YOUR.DOMAIN;
        include snippets/proxy_params;
    }
}
```

由於 `nginx:stable-alpine` 預設沒有 `proxy_params` 設定 proxy header，新增至 `nginx/snippets/proxy_params`

```nginx
proxy_set_header Host $http_host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

修改 `docker-compose.yml` 加入 Nginx 部份，並刪除 gitea 對外的 10800 port。

```yaml
version: "3"
services:
  gitea:
    image: gitea/gitea:latest
    ports:
      - "10022:22"
    volumes:
      - /var/lib/gitea:/data
    container_name: gitea

  nginx:
  image: nginx:stable-alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx/conf.d/:/etc/nginx/conf.d/
```

接著開啟瀏覽器 http://hostname ，測試 80 port 是否能正常開啟 Gitea 網頁，代表確實有透過 Nginx reverse proxy 連接 Docker 內部的 Gitea server。

## Let's Encrypt Setting

安裝 [Certbot](https://certbot.eff.org/)

```bash
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install certbot
```

申請 SSL 憑證

```bash
sudo certbot certonly --standalone -d YOUR.DOMAIN
```

撰寫 Ngnix SSL 憑證 header 設定 `nginx/snippets/ssl-params.conf`，方便未來 SSL 憑證都可以使用。

```nginx
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_prefer_server_ciphers on;
ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
ssl_ecdh_curve secp384r1;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
# disable HSTS header for now
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header X-Frame-Options DENY;
add_header X-Frame-Options SAMEORIGIN;
add_header X-Content-Type-Options nosniff;
```

修改 `nginx/conf.d/gitea.conf`，預期 http（80）的都會移轉至 https（443）

```nginx
upstream YOUR.DOMAIN {
	server gitea:3000;
}

server {
	listen      80;
	listen [::]:80;
	server_name  YOUR.DOMAIN;
	return 301 https://$host$request_uri;
}

server {
	listen      443 ssl http2;
	listen [::]:443 ssl http2;
	server_name YOUR.DOMAIN;
	server_name_in_redirect off;

	location / {
		proxy_pass http://YOUR.DOMAIN;
		include snippets//proxy_params;
	}

  # SSL Setting
	ssl_certificate /etc/letsencrypt/live/YOUR.DOMAIN/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/YOUR.DOMAIN/privkey.pem;
	include snippets/ssl-params.conf;
}
```

記得將本機的 `/etc/letsencrypt` 相關設定掛載到 Nginx container，才能讀取到本機上的憑證，並開啟 443 port 對外開放。

```yaml
version: "3"
services:
  gitea:
    image: gitea/gitea:latest
    ports:
      - "10022:22"
    volumes:
      - /var/lib/gitea:/data
    container_name: gitea

  nginx:
    image: nginx:stable-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d/:/etc/nginx/conf.d/
      - ./nginx/snippets/:/etc/nginx/snippets/
      - /etc/letsencrypt:/etc/letsencrypt
```

# Reference

1. [Gitea docs 用 Docker 安裝](https://docs.gitea.io/zh-tw/install-with-docker/)
1. [Certbot Installation](https://certbot.eff.org/#ubuntuxenial-other)
1. [Automated Nginx Reverse Proxy for Docker](http://jasonwilder.com/blog/2014/03/25/automated-nginx-reverse-proxy-for-docker/)
