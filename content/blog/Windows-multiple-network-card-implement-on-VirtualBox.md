+++
author = "Jerry Wang"
categories = ["windows", "virtualbox", "network"]
date = "2017-05-09"
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Windows multiple network card implement on VirtualBox"
type = "post"

+++


## 前言

由於學校實驗室為了限制網路，因此每一台電腦都需要設定一 Static IP 才能對外連線。原先我們將 server 再接至到一台分享器就解決了這個問題，但又因為希望裡面有一台虛擬機器可以有一 Public IP，因此有了這個「特別」的解法。

### 事前準備

* 兩張網路卡
* 申請一組 Public IP 及對應 MAC Address

### Step 1

開啟 `控制台` -> `網路和網際網路` -> `網路連線`

{{< img-post path="date" file="01-ether-network.png" alt="01-ether-network￼"  >}}

### Step 2

找到對應的網卡後，點選右鍵`內容`並進入`設定`，可以看到下方圖示修改 `Locally Administered Address` ，輸入欄位則是輸入自己想要變動的 MAC Address


{{< img-post path="date" file="02-locally-administered-address.png" alt="02-locally-administered-address￼￼￼"  >}}

### Step 3

回到`設定`，就可以將我們的 Public IP 綁定到網卡上面

{{< img-post path="date" file="03-static-ip-setting.png" alt="03-static-ip-setting￼￼"  >}}
￼
### Step 4

在 Virtual Box 上面，這裡選擇的是 `Network Bridge` 的模式，並且選擇剛剛綁定對外的網路卡

{{< img-post path="date" file="04-virtualbox-networking-setting.png" alt="￼04-virtualbox-networking-setting￼￼"  >}}

### Step 5

在虛擬機器上面，設定 MAC Address 及 Public IP

{{< img-post path="date" file="05-ubuntu-mac-address.png" alt="05-ubuntu-mac-address￼￼￼￼"  >}}

{{< img-post path="date" file="06-ubuntu-static-ip.png" alt="06-ubuntu-static-ip￼"  >}}
