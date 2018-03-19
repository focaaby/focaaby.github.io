+++
author = "Jerry Wang"
categories = ["mysql", "mariadb"]
date = "2018-03-19"
description = "本文介紹如何將 MySQL 5.7 移轉至 MariaDB 10.2"
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Migrating MySQL 5.7 to MariaDB 10.2"
type = "post"

+++

記錄一下把 MySQL 移植更新至 MariaDB 10.2

# 動手做

## 備份

先備份所有的資料及設定黨

1. `mysqldump -u <user> -p --all-databases > all_databases.sql`
1. 備份 `/var/lib/mysql`
1. 備份 `/etc/mysql` 的設定檔

## 刪除 MySQL

務必確定備份好資料後，再進行接下來的動作否則造成~~災難~~

* 刪除 `/var/lib/mysql` 資料夾
* `sudo apt remove mysql mysql-server mysql-common`

## 安裝 MariaDB 10.2

```bash
sudo apt-get install software-properties-common
sudo apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xF1656F24C74CD1D8
sudo add-apt-repository 'deb [arch=amd64,i386,ppc64el] http://ftp.ubuntu-tw.org/mirror/mariadb/repo/10.2/ubuntu xenial main'
sudo apt update
sudo apt install mariadb-server
```

## mysql_upgrade

將原本資料還原到 MariaDB

```bash
mysql -u <user> -p < all_databases.sql
```

接著最重要的步驟，根據 MariaDB 官網

> It's also safe to run mysql_upgrade for minor upgrades, as if there are no incompatibles between versions it changes nothing.

```bash
mysql_upgrade -u <user> -p
```

## GUI 介面

筆者這邊提供兩種方式參考

### Adminer

```bash
sudo apt install adminer
```

### phpMyAdmin

```bash
sudo apt install phpmyadmin
```
這邊需要注意，Ubuntu 將 MySQL 視為相依套件，需要注意不用再額外安裝

兩個套件皆是透過 Ubuntu 套件管理安裝，因此檔案會在目錄 `/usr/share/` 底下

```bash
sudo ln -s /usr/share/adminer /var/www/<directory>
```

接著就是設定 server 部分，即可以完工。

# 參考資料

1. [mysql_upgrade](https://mariadb.com/kb/en/library/mysql_upgrade/)
1. [Moving from MySQL 5.7 to MariaDB 10.1
](https://medium.com/@mcloide/moving-from-mysql-5-7-to-mariadb-10-1-c7cb042ed8d8)


