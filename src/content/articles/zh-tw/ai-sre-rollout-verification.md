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
skills: [observability, ai-assisted-incident-handling]
prerequisiteSkills: []
recommendedArticles: []
publishedAt: 2026-09-28
status: published
---

整理 AI SRE Platform 的演練筆記時，有一組結果很值得留下來：Agent 的日誌寫著 `verified=True`，新的 `orders-api` Pod 卻還在 `CrashLoopBackOff`，也就是容器反覆啟動、失敗，再等待下一次重試。

這篇會用到 Deployment、ReplicaSet 與 Pod 的基本關係；不熟悉的話，可以先看 [Kubernetes 官方 Deployment 說明](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)，再回來看這次演練。

## 刻意讓 restart 修不好

當時把 `orders-api` 設為允許嘗試修復的 tier 2 服務，再注入一個 Deployment 設定本身就有問題的故障。重新啟動只會照同一份壞設定建立 Pod，並不會修正設定。

因此這次要看到的結果是：Agent 嘗試 restart，接著承認沒有修好。若只測「重啟後剛好恢復」的情境，即使驗證器總是回傳成功，也可能看不出問題。

日誌和 Pod 狀態對不上：

```text
INFO:agent:done PodCrashLooping/orders-api action=restart verified=True outcome=verified

kubectl get pods:
orders-api-xxxx   0/1   CrashLoopBackOff
```

`action=restart` 只記錄採取了什麼動作。後面的 `verified=True` 才是在宣告結果，而問題就出在這一步。

## 查到的是舊 Pod

Deployment 使用 rolling update 時，新舊 ReplicaSet 可能同時存在。ReplicaSet 負責維持一組 Pod 的副本數；更新時，新的一組逐步增加，舊的一組逐步縮減，實際節奏受 `maxSurge`、`maxUnavailable` 等設定影響。[Kubernetes 的 Deployment 說明](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment)有這部分的規則。

當時的新舊 Pod 狀態可以簡化成：

```text
orders-api Deployment
├─ 舊 ReplicaSet → Pod 仍然 Ready
└─ 新 ReplicaSet → Pod 反覆崩潰

只問「有沒有 Ready 的 Pod？」→ 舊 Pod 足以讓答案成立
```

舊版驗證器沒有把「目前有健康的 Pod」和「這次更新已完成」分開。

原始 PromQL 還有另一個問題：

```text
count(kube_pod_status_ready{pod=~"orders-api-.*"} == 1) > 0
```

`kube_pod_status_ready` 帶有 `condition` 標籤，值可能是 `true`、`false` 或 `unknown`。沒有指定 `condition="true"`，`== 1` 也可能匹配「未就緒」條件成立的序列，不能直接解讀成 Ready。這可以對照 [kube-state-metrics 的 Pod 指標定義](https://github.com/kubernetes/kube-state-metrics/blob/main/docs/metrics/workload/pod-metrics.md)。

即使補上這個條件，舊 Pod 仍可能讓查詢成立。查詢還需要限定 namespace 與實際工作負載，但單純加嚴篩選，依然不能取代 rollout 驗證。

## 驗證這次更新，而不是任意一個健康 Pod

歷史修正把驗證改為檢查 Deployment status，並將細節寫進 `incident_steps`。檢查涵蓋控制器是否已觀察到變更，以及 updated、ready、available、unavailable 等副本數。

這比只找一個健康 Pod 更接近問題。不過，`readyReplicas`、`availableReplicas` 是 Deployment 的彙總數字，不能只看它們就認定「新版本的 Pod 全部正常」。新舊副本是否仍然並存，也要一起檢查。

下面把這個判斷整理成 Python 函式，輸入是 Kubernetes API 回傳的 Deployment JSON。這是本文的驗證範例，不是歷史 commit 的原始碼。副本數判斷參照 Kubernetes 的 [DeploymentComplete 實作](https://github.com/kubernetes/kubernetes/blob/v1.33.0/pkg/controller/deployment/util/deployment_util.go#L744-L749)，另外固定要驗證的物件 UID 與 generation：

```python
def rollout_complete(deployment, *, target_uid, target_generation):
    metadata = deployment.get("metadata", {})
    spec = deployment.get("spec", {})
    status = deployment.get("status", {})
    desired = spec.get("replicas", 1)

    if (
        metadata.get("uid") != target_uid
        or metadata.get("generation") != target_generation
        or metadata.get("deletionTimestamp") is not None
        or spec.get("paused", False)
        or desired <= 0
    ):
        return False

    complete = (
        status.get("observedGeneration", 0) >= target_generation
        and status.get("updatedReplicas", 0) == desired
        and status.get("replicas", 0) == desired
        and status.get("availableReplicas", 0) == desired
    )
    if not complete:
        return False

    terminating = status.get("terminatingReplicas")
    if terminating is None:
        raise ValueError(
            "terminatingReplicas unavailable; inspect terminating Pods separately"
        )
    return terminating == 0
```

在修復動作被 API 接受後，從回應記下 `metadata.uid` 和 `metadata.generation`；後續輪詢都帶入這兩個固定值，不要每次重新取目標值。Deployment 若被刪除重建，UID 會不同；若有人再改設定，generation 會不同。這兩種情況都不應繼續替原本那次動作宣告成功。

最關鍵的是 `replicas == updatedReplicas == desired`。假設期望兩個副本，新的兩個已建立但都不健康，舊的兩個還能服務，此時 available 可能是 2，但 replicas 是 4，函式會回傳 false。待舊副本退出、兩個新副本可用，才可能通過。零副本也回傳 false，因為這裡驗證的是服務恢復，不是成功縮容到零。

`terminatingReplicas` 受 `DeploymentReplicaSetTerminatingReplicas` feature gate 控制。[官方版本表](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/#feature-gates-for-alpha-or-beta-features)列出它在 Kubernetes 1.33–1.34 為 alpha、預設關閉，從 1.35 起為 beta、預設開啟。這裡引用的 `DeploymentComplete` 原始碼固定在 v1.33.0，避免上游更新後對照失準。

範例多要求一個條件：已知的 terminating 副本數必須為零。四個 rollout 條件成立後，若欄位缺少或為 `null`，函式會拋出 `ValueError`，不再把「不知道」當成零。呼叫端應記錄驗證資料不足，另外檢查屬於該 Deployment 的 ReplicaSet 與 Pod 的 owner reference、終止狀態，再決定是否繼續；不要捕捉例外後直接回報成功。這個額外檢查也只是 API 狀態快照，並非所有舊程序已實際退出的證明。

呼叫端要在期限內持續輪詢：false 代表尚未符合條件，不是第一次檢查就判定修復失敗；逾時或目標已被替換時，保留狀態並交由後續處理。函式通過後，仍要用應用程式的健康檢查或實際請求確認服務可用。

手動排查時，也可以先用下面兩個唯讀指令查看部署狀態。將 namespace 換成自己的環境：

```powershell
$namespace = "your-namespace"
kubectl -n $namespace get deployment orders-api -o yaml
kubectl -n $namespace rollout status deployment/orders-api --timeout=60s
```

`rollout status` 預設追蹤最新 rollout；若觀察期間有人再次更新 Deployment，還需要核對 revision，避免把另一輪更新的結果算到原本的修復上。

Kubernetes 對 [Deployment 完成的定義](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#complete-deployment)，包含副本已更新且可用，以及沒有舊副本仍在執行。即使 rollout 完成，也還要另外確認應用程式的請求是否成功，不能只憑 Kubernetes 狀態就宣告服務恢復。

## 最後留下的是失敗結果

最終紀錄中，`PodNotReady` 和 `TargetDown` 兩筆處理都嘗試了 restart，`verified` 都是 false，對應事件的 outcome 都是 failed。其中一行日誌是：

```text
INFO:agent:done PodNotReady/orders-api action=restart verified=False outcome=failed
```

這符合演練原本的期待：壞設定沒有因為重啟消失，驗證器也沒有再把這兩次處理當成修復成功。

這個案例讓我更在意 Agent 最後拿什麼當證據。指令送出了、Deployment 更新完成了、使用者的請求恢復了，是三件需要分別確認的事。尤其新舊版本同時存在時，一個健康的舊 Pod 很容易把新版本的問題遮住。

本文整理自先前的實驗室演練紀錄；依目前的專案文件，Agent 已改為需要人工核准才執行修復（`REQUIRE_HUMAN_APPROVAL=true`）。
