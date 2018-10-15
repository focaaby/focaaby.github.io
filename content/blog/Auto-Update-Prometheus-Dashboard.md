+++
author = "Jerry Wang"
categories = [""]
date = ""
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = ""
type = "post"

+++


# 前言

緣起是已經將所需要的 metric 收集至 OpenTSDB 串接 Grafana，並設定相關 alert threshold 了，但如果 threshold 需要時常變動就需要人工進入 dashboard 修改其數值，會非常耗時。
因此本篇想利用 Grafana API 來達成自動設定 alert threshold。

# 流程設計

1. 先將已經設定好的 config
1. 利用 GitLab CI，讓每次修改 config 檔都會自動透過 API 更新其 dashbaord threshold 內容


# 動手做

## Grafana API

取得 [Grafana API token](http://docs.grafana.org/http_api/auth/)，並列出設定過的 alerts

```
GET /api/alerts HTTP/1.1
Accept: application/json
Content-Type: application/json
Authorization: Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk
```

但是非常可惜的是 [Alerting API](http://docs.grafana.org/http_api/alerting/) 並沒有辦法修改 alert 設定。

> You can use the Alerting API to get information about alerts and their states but this API cannot be used to modify the alert. To create new alerts or modify them you need to update the dashboard json that contains the alerts.
> This API can also be used to create, update and delete alert notifications.

因此我們換了一個方向，從 Dashboard API 下手

```
POST /api/dashboards/db HTTP/1.1
Accept: application/json
Content-Type: application/json
Authorization: Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk

{
  "dashboard": {
    "id": null,
    "uid": null,
    "title": "Production Overview",
    "tags": [ "templated" ],
    "timezone": "browser",
    "schemaVersion": 16,
    "version": 0
  },
  "folderId": 0,
  "overwrite": false
}
```

有趣的是，原以為 dashboard 內容非常少但其實可以直接將 dashboard 匯出的 JSON 檔案整份作為參數來輸入。

- 優點：可以直接拿 grafana_dashboard.json 作為 config
- 缺點：要調整參數時需要找到對應數值比較麻煩

# 相關連結

1. [Grafana - Authentication API](http://docs.grafana.org/http_api/auth/)

