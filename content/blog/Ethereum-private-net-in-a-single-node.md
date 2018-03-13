+++
author = "Jerry Wang"
categories = ["ethereum", "blockchain"]
date = "2018-03-08T15:57:07+08:00"
description = "本文簡介如何透過 go-ethereum 專案來建制自己單節點的私有鏈"
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Setting up Ethereum private net in a single node"
type = "post"
+++

# Ethereum 簡介

一個 [Open source 的專案](https://github.com/ethereum/)，最具著名的就是用有圖靈完備語法的智能合約。

# 動手做

在 Ethereum Homestead 有提到許多種的 client 可以使用，筆者挑選目前較多人使用的 go-ethereum。

## 安裝 Ethereum

### Ubuntu

```bash
sudo apt-get install software-properties-common
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum
```

### macOS

```bash
brew tap ethereum/ethereum
brew install ethereum
```

## 創始區塊

在每個區塊鏈都必須有一個創始區塊，而本範例是透過 go-ethereum 建立私有鏈，而非連上 Ethereum 的主鏈。

建立一個 `genesis.json`

```json
{
    "config": {
        "chainId": 15,
        "homesteadBlock": 0,
        "eip155Block": 0,
        "eip158Block": 0
    },
    "difficulty": "200000000",
    "gasLimit": "2100000",
    "alloc": {
        "7df9a875a174b3bc565e6424a0050ebc1b2d1d82": { "balance": "300000" },
        "f41c74c9ae680c1aa78f42e5647a62f353b7bdde": { "balance": "400000" }
    }
}
```

透過 `geth init genesis.json` 初始化私有鏈


## geth 指令

```bash
geth --networkid 9487 \
     -rpc \
     --rpcaddr "0.0.0.0" \
     --rpccorsdomain "*" \
     --rpcapi "admin, db, eth, debug, miner, net, shh, txpool, personal, web3" \
     console
```

console 參數：

* networkid：如果連結多節點時，需要統一個 `networkid` 才能連線
* rpc：開啟 HTTP-RPC server
* rpcaddr：預設聽 `localhost`，要給外面連線 RPC。
* rpccorsdomain： 跨來源資源共享（CORS）
* rpcapi：提供哪些 API，筆者這邊是全開以方便測試


# 參考連結

1. [Ethereum GitHub](https://github.com/ethereum/)
2. [Ethereum Homestead](http://www.ethdocs.org/en/latest/index.html)
3. [go-ethereum](https://github.com/ethereum/go-ethereum/)
4. [Private network](https://github.com/ethereum/go-ethereum/wiki/Private-network)