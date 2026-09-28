---
id: ai-sre-rollout-verification-zh-tw
slug: ai-sre-rollout-verification
title: Agent 說修好了，新的 Pod 卻還在 CrashLoopBackOff
description: 從 AI SRE Platform 的一次故障演練，追查為什麼舊 Pod 會讓修復驗證誤判，以及 action、rollout 與服務恢復之間的差別。
locale: zh-TW
translationKey: ai-sre-rollout-verification
contentType: case-study
difficulty: intermediate
topics: [cloud-native, sre, ai-engineering]
skills: [kubernetes-gitops, observability, ai-assisted-incident-handling]
prerequisiteSkills: [kubernetes-gitops]
recommendedArticles: []
status: draft
---

整理 AI SRE Platform 的演練筆記時，有一組結果很值得留下來：Agent 的日誌寫著 `verified=True`，新的 `orders-api` Pod 卻還在 `CrashLoopBackOff`，也就是容器反覆啟動、失敗，再等待下一次重試。

這篇整理的是實驗室專案的歷史演練。筆記目前標示的設定已改為 `REQUIRE_HUMAN_APPROVAL=true`，修復需要人工核准；以下自動執行 restart 的情境屬於當時的設定。

## 刻意讓 restart 修不好

當時把 `orders-api` 設為允許嘗試修復的 tier 2 服務，再注入一個 Deployment 設定本身就有問題的故障。重新啟動只會照同一份壞設定建立 Pod，並不會修正設定。

因此這次要看到的結果是：Agent 嘗試 restart，接著承認沒有修好。若只測「重啟後剛好恢復」的情境，即使驗證器總是回傳成功，也可能看不出問題。

原始紀錄留下了這段互相矛盾的輸出；Pod 名稱的尾碼在筆記中已簡寫：

```text
INFO:agent:done PodCrashLooping/orders-api action=restart verified=True outcome=verified

kubectl get pods:
orders-api-xxxx   0/1   CrashLoopBackOff
```

`action=restart` 只記錄採取了什麼動作。後面的 `verified=True` 才是在宣告結果，而問題就出在這一步。

## 查到的是舊 Pod

Deployment 使用 rolling update 時，新舊 ReplicaSet 可能同時存在。ReplicaSet 負責維持一組 Pod 的副本數；更新時，新的一組逐步增加，舊的一組逐步縮減，實際節奏受 `maxSurge`、`maxUnavailable` 等設定影響。[Kubernetes 的 Deployment 說明](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment)有這部分的規則。

這次筆記記錄的誤判情境可以簡化成：

```text
orders-api Deployment
├─ 舊 ReplicaSet → Pod 仍然 Ready
└─ 新 ReplicaSet → Pod 反覆崩潰

只問「有沒有 Ready 的 Pod？」→ 舊 Pod 足以讓答案成立
```

舊版驗證器沒有把「目前有健康的 Pod」和「這次更新已完成」分開。

筆記中的原始 PromQL 還有另一個問題：

```text
count(kube_pod_status_ready{pod=~"orders-api-.*"} == 1) > 0
```

`kube_pod_status_ready` 帶有 `condition` 標籤，值可能是 `true`、`false` 或 `unknown`。沒有指定 `condition="true"`，`== 1` 也可能匹配「未就緒」條件成立的序列，不能直接解讀成 Ready。這可以對照 [kube-state-metrics 的 Pod 指標定義](https://github.com/kubernetes/kube-state-metrics/blob/main/docs/metrics/workload/pod-metrics.md)。

即使補上這個條件，舊 Pod 仍可能讓查詢成立。查詢還需要限定 namespace 與實際工作負載，但單純加嚴篩選，依然不能取代 rollout 驗證。

## 把這次更新的狀態留下來

歷史修正把驗證改為檢查 Deployment status，並將細節寫進 `incident_steps`。檢查涵蓋控制器是否已觀察到變更，以及 updated、ready、available、unavailable 等副本數。

這比只找一個健康 Pod 更接近問題。不過，`readyReplicas`、`availableReplicas` 是 Deployment 的彙總數字，不能只看它們就認定「新版本的 Pod 全部正常」。新舊副本是否仍然並存，也要一起檢查。

手動排查時，可以先用下面兩個唯讀指令查看部署狀態。將 namespace 換成自己的環境：

```powershell
$namespace = "your-namespace"
kubectl -n $namespace get deployment orders-api -o yaml
kubectl -n $namespace rollout status deployment/orders-api --timeout=60s
```

這裡的 60 秒只是示範的等待上限，不是這次演練的實測恢復時間。`rollout status` 預設追蹤最新 rollout；若觀察期間有人再次更新 Deployment，還需要核對 revision，避免把另一輪更新的結果算到原本的修復上。

Kubernetes 對 [Deployment 完成的定義](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#complete-deployment)，包含副本已更新且可用，以及沒有舊副本仍在執行。即使 rollout 完成，也還要另外確認應用程式的請求是否成功，不能只憑 Kubernetes 狀態就宣告服務恢復。

## 最後留下的是失敗結果

筆記記錄的最終結果中，`PodNotReady` 和 `TargetDown` 兩筆處理都嘗試了 restart，`verified` 都是 false，對應事件的 outcome 都是 failed。其中一行日誌是：

```text
INFO:agent:done PodNotReady/orders-api action=restart verified=False outcome=failed
```

這符合演練原本的期待：壞設定沒有因為重啟消失，驗證器也沒有再把這兩次處理當成修復成功。這些是既有筆記保留的結果，整理文章時沒有重新對雲端環境注入故障。

這個案例讓我更在意 Agent 最後拿什麼當證據。指令送出了、Deployment 更新完成了、使用者的請求恢復了，是三件需要分別確認的事。尤其新舊版本同時存在時，一個健康的舊 Pod 很容易把新版本的問題遮住。
