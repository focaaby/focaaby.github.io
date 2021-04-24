+++
author = "Jerry Wang"
categories = ["aws", "eks", "k8s", "kubernetes", "elb" ]
date = "2021-04-23"
description = "While deploying both client and server on their EKS cluster and connect through internal NLB, however, the communication gets timeout randomly."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "EKS service with internal NLB, but gets timeouts randomly"
type = "post"

+++


## Summary

While deploying both client and server on their EKS cluster and connect through internal NLB, however, the communication gets timeout randomly.

## Problem

In Kubernetes, we can expose the pod to cluster with Kubernetes Service. For sure, we can create a Kubernetes Service of type LoadBalancer, AWS NLB or CLB is provisioned that load balances network traffic.

![Kubernetes Service](https://i0.wp.com/www.docker.com/blog/wp-content/uploads/2019/09/Kubernetes-NodePort-Service-2.png?w=1069&ssl=1)

Figure source: [https://www.docker.com/blog/designing-your-first-application-kubernetes-communication-services-part3/](https://www.docker.com/blog/designing-your-first-application-kubernetes-communication-services-part3/)

To manage the workload easily, we might want to deploy both the client and server sides on Kubernetes. However, in the following conditions, you might notice the timeout issue happen randomly.

This use case includes both server-side and client-side in the same EKS cluster, and the server-side must use Kubernetes service with internal NLB - instance target type.

1. Create a Kubernetes Deployment as server-side. For example, self-host Redis, Nginx server, etc.
2. Create a Kubernetes Service to expose the server application through the internal NLB.
3. Create another Kubernetes Deployment to test the application as client-side, and try to connect with the server's service.

## Reproduce

In my testing, I launched the Kubernetes cluster with Amazon EKS (1.8.9) with default deployments (such as CoreDNS, AWS CNI Plugin, and kube-proxy). The issue can be reproduced as the steps below:

1. Deploy a Nginx Deployment and a troubleshooting container. I used the netshoot as troubleshooting pod, which had preinstalled the `curl` command. Also, you can find the `nginx-nlb-service.yaml` and `netshoot.yaml` in the attachments.

    ```bash
    $ kubectl apply -f ./netshoot.yaml
    $ kubectl apply -f ./nginx-nlb-service.yaml
    ```

    {{< img-post path="date" file="EKS-internal-NLB-netshoot.png" alt="" >}}

2. Use the `kubctl exec` command to attach into troubleshooting(netshoot) container.

    ```bash
    $ kubectl exec -it netshoot -- bash
    bash-5.1#
    ```

3. Access the internal NLB domain name(Nginx's Service) via `curl` command, the connection will timeout randomly. In the same time, I capture the packets through with `tcpdump` command in EKS worker node.

    ```bash
    # In the EKS worker node(192.168.2.3)
    $ sudo tcpdump -i any  -w packets.pcap

    bash-5.1# date
    Mon Mar 22 23:35:13 UTC 2021

    bash-5.1# curl a7487a27201f2434490bada8096adce3-221f6e1d21fadd5b.elb.eu-west-1.amazonaws.com
    ... It will timeout randomly, you might need to try more times.
    ...

    $ date
    Mon Mar 22 23:35:32 UTC 2021
    ```

## Why we get the timeout from internal NLB

Firstly, we must know the NLB introduced the source ip address preservation feature[3]: the original IP addresses and source ports for the incoming connections remain unmodified. When the backend answers a request, the VPC internals capture this packet and forward it to the NLB, which will forward it to its destination.

Therefore, if the worker node is running the client-side, and NLB forward to the same nodes. It will generate a random connection timeout. We can dive into this process:

{{< img-post path="date" file="EKS-internal-NLB-seq.png" alt="EKS internal NLB sequence flow " >}}

1. The troubleshooting container starts from an ephemeral port and sends a SYN packet.
    - src: 192.168.27.239:49134
    - dst: 192.168.168.103:80
2. The NLB receives the SYN packet and forwards it to the backend EKS worker node 192.168.2.3 with target port 31468, which was registered by Kubernetes Service. NLB modified the destination IP address as Client IP preservation feature. Thus, the EKS worker node receives a SYN packet:
    - src: 192.168.27.239:49134
    - dst: 192.168.2.3:31468
3. Base on the iptables rules(Nginx Service) on the EKS worker node, this SYN packet was forwarded to the Nginx pod.
    - src: 192.168.2.3:19969
    - dst: 192.168.16.142:80
        ```bash
        # Kubernetes Service will update the following iptables rules in every node.
        $ sudo iptables-save | grep "service-nginx-demo"
        -A KUBE-NODEPORTS -p tcp -m comment --comment "nginx-demo/service-nginx-demo:" -m tcp --dport 31919 -j KUBE-MARK-MASQ
        -A KUBE-NODEPORTS -p tcp -m comment --comment "nginx-demo/service-nginx-demo:" -m tcp --dport 31919 -j KUBE-SVC-7D7VEXWNCKBQRZ7W
        -A KUBE-SEP-2IF7DICDPRGPK5UI -s 192.168.39.2/32 -m comment --comment "nginx-demo/service-nginx-demo:" -j KUBE-MARK-MASQ
        -A KUBE-SEP-2IF7DICDPRGPK5UI -p tcp -m comment --comment "nginx-demo/service-nginx-demo:" -m tcp -j DNAT --to-destination 192.168.39.2:80
        -A KUBE-SEP-2V4THTSJVFKRX4LC -s 192.168.16.142/32 -m comment --comment "nginx-demo/service-nginx-demo:" -j KUBE-MARK-MASQ
        -A KUBE-SEP-2V4THTSJVFKRX4LC -p tcp -m comment --comment "nginx-demo/service-nginx-demo:" -m tcp -j DNAT --to-destination 192.168.16.142:80
        -A KUBE-SEP-73EDW25F4C3YFWYZ -s 192.168.49.70/32 -m comment --comment "nginx-demo/service-nginx-demo:" -j KUBE-MARK-MASQ
        -A KUBE-SEP-73EDW25F4C3YFWYZ -p tcp -m comment --comment "nginx-demo/service-nginx-demo:" -m tcp -j DNAT --to-destination 192.168.49.70:80
        -A KUBE-SERVICES -d 10.100.235.20/32 -p tcp -m comment --comment "nginx-demo/service-nginx-demo: cluster IP" -m tcp --dport 80 -j KUBE-SVC-7D7VEXWNCKBQRZ7W
        -A KUBE-SVC-7D7VEXWNCKBQRZ7W -m comment --comment "nginx-demo/service-nginx-demo:" -m statistic --mode random --probability 0.33333333349 -j KUBE-SEP-2IF7DICDPRGPK5UI
        -A KUBE-SVC-7D7VEXWNCKBQRZ7W -m comment --comment "nginx-demo/service-nginx-demo:" -m statistic --mode random --probability 0.50000000000 -j KUBE-SEP-73EDW25F4C3YFWYZ
        -A KUBE-SVC-7D7VEXWNCKBQRZ7W -m comment --comment "nginx-demo/service-nginx-demo:" -j KUBE-SEP-2V4THTSJVFKRX4LC
        ```

4. Nginx pod replies the SYN-ACK packet back to the EKS worker node. We can view the `tcp.stream eq 9` for step 3 and step4.

    {{< img-post path="date" file="internal-nlb-tcp9.png" alt="tcpdump stream 9" >}}

5. VPC CNI plugin maintains the route table for binding the ENI with pod. Base on the route table in Node 1, it will reply the SYN-ACK packet for the SYN packet for troubleshooting pod in step 2.

    ```bash
    # Node 1 - routing table

    $ route -n
    Kernel IP routing table
    Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
    0.0.0.0         192.168.32.1    0.0.0.0         UG    0      0        0 eth0
    169.254.169.254 0.0.0.0         255.255.255.255 UH    0      0        0 eth0
    192.168.32.0    0.0.0.0         255.255.224.0   U     0      0        0 eth0
    192.168.27.239  0.0.0.0         255.255.255.255 UH    0      0        0 eni708fb089496
    ...
    ```

6. The troubleshooting pod notices this SYN-ACK connection is an abnormal connection, and send RST packet to close the connection to `192.168.2.3:31468`.
7. The RST packet is forwarded to the Nginx pod through iptables rules(Nginx server) as well. Also, the troubleshooting container will send both TCP_RETRANSMISSION and RST several times until it times out.

    {{< img-post path="date" file="internal-nlb-tcp8.png" alt="tcpdump stream 8" >}}

8. The initiating socket(src: 192.168.27.239:49134, dst: 192.168.168.103:80) still expects the SYN-ACK from the NLB 192.168.168.103:80. However, the troubleshooting pod did not receive the SYN-ACK, so the troubleshooting pod will send several TCP RETRANSMISSION - SYN until it times out.

    {{< img-post path="date" file="internal-nlb-tcp7.png" alt="tcpdump stream 7" >}}

## Workaround

If the you doesn't care about keeping the source IP address, we can suggest the you can consider using the NLB IP mode[4].

```yaml
metadata:
      name: my-service
      annotations:
        service.beta.kubernetes.io/aws-load-balancer-type: "nlb-ip"
```

The NLB adds support to configure client IP preservation[5], therefore, we can expect that AWS LoadBalancer Controller will support the same feature in the future.


## References

1. Connecting Applications with Services - [https://kubernetes.io/docs/concepts/services-networking/connect-applications-service/](https://kubernetes.io/docs/concepts/services-networking/connect-applications-service/)
2. Network load balancing on Amazon EKS  - [https://docs.aws.amazon.com/eks/latest/userguide/load-balancing.html](https://docs.aws.amazon.com/eks/latest/userguide/load-balancing.html)
3. Target groups for your Network Load Balancers - Client IP preservation[https://docs.aws.amazon.com/elasticloadbalancing/latest/network/load-balancer-target-groups.html#client-ip-preservation](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/load-balancer-target-groups.html#client-ip-preservation)
4. [https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/guide/service/nlb_ip_mode/#nlb-ip-mode](https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/guide/service/nlb_ip_mode/#nlb-ip-mode)
5. [https://docs.aws.amazon.com/elasticloadbalancing/latest/network/load-balancer-target-groups.html#client-ip-preservation](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/load-balancer-target-groups.html#client-ip-preservation)