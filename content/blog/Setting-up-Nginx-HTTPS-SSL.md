+++
author = "Jerry Wang"
categories = ["ubuntu", "nginx", "ssl", "letsencrypt", "https"]
date = "2017-08-02"
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Setting up Ubuntu 16.04 Nginx HTTPS SSL"
type = "post"
+++



# 前言

原先管理的主機是從 Ubuntu 14.04 升級至 16.04，當時所使用的 Let’s Encrypt certbot 版本也很舊了，終於有點時間來做整理。

# 前後比較

查看了幾篇的文章 [1, 2, 3] 之後發現

- 目前的 Let’s Encrypt certbot 已經可以透過 PPA 來安裝。可以到 [certbot 官網](https://certbot.eff.org/) 勾選使用的 service 及 OS 則有對應的教學。如選擇 Nginx + Ubuntu 16.04

```bash=
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx
```

- 多數寫成 `nginx snippets` 在 `.conf` 中去 include 即可以使用，也就不必在每個 conf 重複撰寫一樣的設定。[4, 5]

 ```nginx=
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
add_header X-Content-Type-Options nosniff;

ssl_dhparam /etc/ssl/certs/dhparam.pem;
 ```

- certbot 無須逐站申請，可以透過以下 command 直接執行，會去檢查 你現在的 nginx 上目前有上線的站申請憑證

```bash=
sudo certbot --nginx or // sudo certbot --nginx certonly
```

# 整理後的設定檔

```nginx=
server {
	listen 80;
	listen [::]:80;
	server_name [YOUR_DOMAIN];
	return 301 https://$host$request_uri;
}

server {
	listen 443 ssl http2;
	listen [::]:443 ssl http2;

	server_name [YOUR_DOMAIN];
	server_name_in_redirect off;

	access_log /var/log/nginx/[YOUR_DIRECTORY].access_log;
	error_log /var/log/nginx/[YOUR_DIRECTORY].error_log info;

	root /var/www/[YOUR_DIRECTORY];
	index index.php index.html index.htm default.html default.htm;

	# SSL
	location /.well-known {
		allow all;
	}

	include snippets/ssl-[YOUR_SITE_SSL_DIRECTORY].conf;
	include snippets/ssl-params.conf;

	# php setting
	include snippets/joomla.conf;
}
```

而 `snippets/ssl-params.conf` 部分就是，第二點的 snippet

並且整理 joomla 及 php 的設定檔成 snippet

```nginx=
# joomla
location / {
	try_files $uri $uri/ /index.php?$args;
}

location ~* /(images|cache|media|logs|tmp)/.*\.(php|pl|py|jsp|asp|sh|cgi)$ {
	return 403;
	error_page 403 /403_error.html;
}

location ~* \.(ico|pdf|flv)$ {
	expires 1y;
}

location ~* \.(js|css|png|jpg|jpeg|gif|swf|xml|txt)$ {
	expires 14d;
}

# php
location ~ \.php$ {
	fastcgi_pass unix:/run/php/php7.0-fpm.sock;
	fastcgi_index index.php;
	include fastcgi_params;
	fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
	fastcgi_read_timeout 300;
	include /etc/nginx/fastcgi.conf;
}
```
# 心得

整理後的 site config 把原先的 50 多行整理到剩不到 30 行，扣除各個網站不同需求，整理完的 snippet 也都可以重複利用。

SSL 憑證方面，再次證明了 opensource 的強大之處，certbot 已經是非常完善的套件，初次使用也可以快速設定好憑證，期待 Let’s Encrypt 明年的 Wildcard Certificates [6]，如此一來只需要一個憑證就可以將該所 sub-domain 設定好。

# 相關連結

1. [How To Secure Nginx with Let's Encrypt on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)
1. [How to setup Let's Encrypt for Nginx on Ubuntu 16.04 (including IPv6, HTTP/2 and A+ SLL rating)](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)
1. [在 Ubuntu 使用 Lets Encrypt 與 Nginx](https://blog.technologyofkevin.com/?p=591)
1. [Cipherli.st Strong Ciphers for Apache, nginx and Lighttpd](https://cipherli.st/)
1. [Strong SSL Security on nginx](https://raymii.org/s/tutorials/Strong_SSL_Security_On_nginx.html)
1. [Wildcard Certificates Coming January 2018](https://letsencrypt.org/2017/07/06/wildcard-certificates-coming-jan-2018.html)

