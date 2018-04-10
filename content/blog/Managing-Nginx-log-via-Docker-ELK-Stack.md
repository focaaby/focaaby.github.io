+++
author = "Jerry Wang"
categories = ["elasticsearch", "Logstash", "Kibana"]
date = "2018-04-10"
description = "本文利用 Docker 建立 ELK Stack 管理 Nginx log"
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Managing Nginx log via Docker ELK Stack"
type = "post"

+++

# 前因

經常在 DevOps TW 看到分析管理 log 有那些套件可以使用，傳統來說彙整 log 會使用 [RSYSLOG](https://www.rsyslog.com/)，而筆者想要嘗試的則是近幾年興起應用於 big data 的圖表分析 Elasticsearch + Logstash + Kibana，取每個元件字首簡稱 ELK Stack。

# 選用原因

主要筆者的環境需要將簡單將 `syslog` 或 Nginx `acess_log` 日誌檔案做基本處理，且具有 buffer 功能。
而 Logstash 就是具有以上功能並有 pipeline 分成三階段（inputs → filters → outputs）的概念：

1. input：接受檔案、syslog（符合 RFC3164 標準）或像 Redis broker 當作輸入來源。
2. filter：`grok` 相似正規表示法，但較方便於將 log file 處理成想要的格式。
3. ouput：經過 filter 處理過的資料，輸出結果多樣。如：檔案、Elatcsearch、statsd 等。

# 動手做

筆者習慣利用 docker 來架設測試環境，當然也有已經整理好的 [Docker ELK stack Github repo](https://github.com/deviantony/docker-elk)

## 啟用 ELK Stack

```bash
git clone https://github.com/deviantony/docker-elk.git
cd docker-elk
docker-compose up -d
```

靜候幾秒後，瀏覽器打開 `http:localhost:5601` 就有 Kibana 的 dashboard 了。第一次的時候還需要設定 `index patterns`。

Github REAME 提供了 command line 方式，當然在 dashboard 點選設定也沒有問題。

```bash
curl -XPOST -D- 'http://localhost:5601/api/saved_objects/index-pattern' \
    -H 'Content-Type: application/json' \
    -H 'kbn-version: 6.2.2' \
    -d '{"attributes":{"title":"logstash-*","timeFieldName":"@timestamp"}}'

```

預設 Logstash 允許透過 TCP 5000 port 來送 log 資料。

```bash
nc localhost 5000 < /path/to/logfile.log
```

# 新增 nginx docker 測試 log

在 `docker-compose.yaml` 加入 Nginx 並將 log 也掛載於 Logstash。

修改後的 `docker-compose.yaml`

```yaml
version: '2'

services:

  elasticsearch:
    build:
      context: elasticsearch/
    volumes:
      - ./elasticsearch/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro
    ports:
      - "9200:9200"
      - "9300:9300"
    environment:
      ES_JAVA_OPTS: "-Xmx256m -Xms256m"
    networks:
      - elk

  logstash:
    build:
      context: logstash/
    volumes:
      - ./logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml:ro
      - ./logstash/pipeline:/usr/share/logstash/pipeline:ro
      - ./nginx/log/:/var/log/nginx/
    ports:
      - "5000:5000"
    environment:
      LS_JAVA_OPTS: "-Xmx256m -Xms256m"
    networks:
      - elk
    depends_on:
      - elasticsearch

  kibana:
    build:
      context: kibana/
    volumes:
      - ./kibana/config/:/usr/share/kibana/config:ro
    ports:
      - "5601:5601"
    networks:
      - elk
    depends_on:
      - elasticsearch

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/log/:/var/log/nginx/
    ports:
      - "80:80"
    networks:
      - elk

networks:

  elk:
    driver: bridge
```

接著需要修改一下 Logstash 的設定檔 `./logstash/pipline/logstash.conf`，於 `input` 內加入 `file` 讀取 Nginx log。

```
input {
    tcp {
        port => 5000
    }

    file {
        path => "/var/log/nginx/access.log"
        start_position => beginning
    }
}

filter {
    if [path] =~ "access" {
        mutate { replace => { "type" => "nginx_access" } }
        grok {
                match => { "message" => "%{COMBINEDAPACHELOG}" }
        }
    }
    date {
        match => [ "timestamp" , "dd/MMM/yyyy:HH:mm:ss Z" ]
    }
}

## Add your filters / logstash plugins configuration here

output {
    elasticsearch {
        hosts => "elasticsearch:9200"
    }
}
```

筆者這邊是利用 [Apache Bench](https://httpd.apache.org/docs/2.4/programs/ab.html) 測試 Nginx 產生 `access_log`。

```bash
ab -c 50 -n 50 -t 10 http://127.0.0.1/
```

最後回到 Kibana dashboard 即可以查看 log message。

{{< img-post path="date" file="kibana-with-nginx-log.png" alt="kibana-with-nginx-log￼"  >}}



# 參考連結

1. [RSYSLOG](https://www.rsyslog.com/)
1. https://www.elastic.co/guide/en/logstash/master/pipeline.html
1. 滿完整簡淺易懂的介紹 ELK Stack：http://www.evanlin.com/using-logstash-elsticsearch-and-kibana/