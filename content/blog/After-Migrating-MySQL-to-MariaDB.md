+++
author = "Jerry Wang"
categories = ["mysql", "mariadb", "apparmor"]
date = "2018-03-31"
description = "解決移轉至 MariaDB 重啟伺服器之後持續遇到 AppArmor 阻擋 MariaDB 之問題"
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "After Migrating MySQL to MariaDB, AppArmor blocks MariaDB"
type = "post"

+++

## 前言

繼[上篇](https://focaaby.github.io/blog/migrating-mysql-2-mariadb/)移轉 MySQL 至 MariaDB 成功後都尚未重開伺服器過，重起之後發現 DB 持續無法正常開始運作。

## 檢查 log

MariaDB 的 error log 於 syslog。

```bash
cat /var/log/syslog.1 | grep mysql
```

找到錯誤部分

```bash
Mar 30 17:24:51 host mysqld[1274]: Version: '10.2.14-MariaDB-10.2.14+maria~xenial-log'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  mariadb.org binary distribution
Mar 30 17:24:51 host kernel: [   28.492966] audit: type=1400 audit(1522401891.184:11): apparmor="DENIED" operation="sendmsg" info="Failed name lookup - disconnected path" error=-13 profile="/usr/sbin/mysqld" name="run/systemd/notify" pid=1274 comm="mysqld" requested_mask="w" denied_mask="w" fsuid=105 ouid=0
Mar 30 17:25:24 host mysqld[1274]: 2018-03-30 17:25:24 139927115249408 [Note] InnoDB: Buffer pool(s) load completed at 180330 17:25:24
Mar 30 17:26:11 host mysqld[1274]: 2018-03-30 17:26:11 139928163120896 [Note] /usr/sbin/mysqld (initiated by: unknown): Normal shutdown
Mar 30 17:26:11 host mysqld[1274]: 2018-03-30 17:26:11 139928163120896 [Note] Event Scheduler: Purging the queue. 0 events
Mar 30 17:26:11 host mysqld[1274]: 2018-03-30 17:26:11 139927148820224 [Note] InnoDB: FTS optimize thread exiting.
Mar 30 17:26:11 host kernel: [  108.349415] audit: type=1400 audit(1522401971.049:12): apparmor="DENIED" operation="sendmsg" info="Failed name lookup - disconnected path" error=-13 profile="/usr/sbin/mysqld" name="run/systemd/notify" pid=1274 comm="mysqld" requested_mask="w" denied_mask="w" fsuid=105 ouid=0
```

## 原因

首先找到[相關問題](https://askubuntu.com/questions/750604/why-does-mariadb-keep-dying-how-do-i-stop-it)是將 AppArmor 加入 MySQL 的設定檔，不過嘗試無效。

AppArmor 簡介：

> AppArmor 是一個類似 SELinux 的 LSM (Linux Security Module) 來, LSM 它是一個系統 Kernel 內負責管理安全的 module, 我們可以用它是用來做MAC (mandatory access controls) 的。

[查看](https://bugs.launchpad.net/maria/+bug/876550)後發現 MariaDB 於 5.x 版之後已經不再有預設 AppArmor。

因此可以將原先 MySQL AppArmor 的設定部分關閉。


## 解決方法

```bash
sudo ln -s /etc/apparmor.d/usr.sbin.mysqld /etc/apparmor.d/disable/
sudo reboot
```

接著再將伺服器重開機即可。

## 參考連結

1. https://askubuntu.com/questions/750604/why-does-mariadb-keep-dying-how-do-i-stop-it
1. https://datahunter.org/apparmor：簡介了 AppArmor 用途
1. https://bugs.launchpad.net/maria/+bug/876550： The default AppArmor profile in MariaDB for Ubuntu has been removed.
