+++
author = "Jerry Wang"
categories = ["distributed-system", "raft", "algorithm"]
date = "2017-11-28"
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Raft algorithm(1)"
type = "post"

+++

# 前言

在嘗試事做分散式的架構時，原則上在多台機器同時需要處理一件事情的時候，但是多台機器必須知道這項事情是否被處理、紀錄等，舉例： 若有 message queue（後簡稱 MQ）架設成叢集式架構，那如何讓不同的機器保持有一樣 MQ 順序不亂，機器間溝通就需要有「共識」，讓每個人來拿的都是同一個順序。


# 什麼是 Raft

Raft 是一容易理解的共識演算法，具有與 Paxos 演算法相當的容錯與效能。

## 何謂「共識」？

分散式系統容錯中十分重要的問題，包含了多台伺服器同意數值的改變。傳統的共識演算法需要過多數決（magority）來進行共識，舉例來說：一個 5 台伺服器叢集系統，可以允許在兩台伺服器當機，而其餘伺服器持續運作；倘若有更多台伺服器當機，就會停止運作。

# 第一章節：介紹

將近十年來多數共識演算法都是基於 Paxos 或是受它影響，也就成為主流教導學生的題材。很不幸運的事 Paxos 演算法並不是那麼容易理解，需要更複雜的架構來實作系統。

Raft 設計理念為「非常容易理解（understandability）」的共識演算法。

分別在兩間學校找了 43 個學生來實驗：學習兩種不同的演算法，其中 33 名學生有能力回答 Raft 演算法問題比 Paxos 演算法來的更好。

儘管 Raft 與許多既有的共識演算法類似，以下是幾個新穎的特色：

- String leader：Raft 使用了比較強的領導權。舉例： 其他的伺服器 log entries 僅來自於 leader。
- Leader election：Raft 使用隨機倒數計時來選 leader，對於任一共識演算法而言也僅增加一小部分既有的 heartbeats，可以解決衝突更簡單快速。
- Membership changes：Raft 在變更機器數量時，會新增一個 joint consensus ，來解決兩個不同的設定重疊問題。設定變化時，叢集仍可繼續正常運作。

之後章節的簡介：

- 第二章節：replicated state machine problem
- 第三章節：討論 strengths 和 weakness of Paxos
- 第四章節：描述如何達到「容易理解性」
- 第五～八章節：闡述 Raft 共事演算法
- 第九章節：如何評估 Raft
- 第十章節：相關文獻

# 小結語

先前稍微研究了 [Zookeeper 的演算法](https://pdfs.semanticscholar.org/fc11/031895c302dc52404d34de58af1a72f3b817.pdf)，目前覺得看起來重複性也是滿高的，應該有許多細節是尚未釐清，但是也沒有看過 Paxos 演算法，得花點時間了解一下了。

許多區塊鏈的底層實作共識逐漸往 Raft 發展，[etcd](https://github.com/coreos/etcd) 也是實作 Raft 演算法，Raft 主站甚至還列出所有實作的 opensource 專案來可提供大家使用，整體看來是一個非常具有可看性且高發展的演算法。

# Reference

1. Raft 演算法：https://raft.github.io/
1. Paper：https://raft.github.io/raft.pdf
1. [ Zookeeper 演算法（Zab: High-performance broadcast for
primary-backup systems）](https://pdfs.semanticscholar.org/fc11/031895c302dc52404d34de58af1a72f3b817.pdf)
