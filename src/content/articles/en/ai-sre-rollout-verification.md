---
id: ai-sre-rollout-verification-en
slug: ai-sre-rollout-verification
title: The agent reported success while the new Pods kept crashing
description: A fault-injection drill in AI SRE Platform exposed how old Pods could fool repair verification, and why an action, a completed rollout and service recovery need separate evidence.
locale: en
translationKey: ai-sre-rollout-verification
contentType: case-study
difficulty: intermediate
topics: [cloud-native, sre, ai-engineering]
skills: [kubernetes-gitops, observability, ai-assisted-incident-handling]
prerequisiteSkills: [kubernetes-gitops]
recommendedArticles: []
status: draft
---

While organizing my AI SRE Platform drill notes, one pair of results stood out: the agent logged `verified=True`, but a new `orders-api` Pod was still in `CrashLoopBackOff`. Its container kept starting, failing and waiting before another retry.

This article covers a historical drill in the lab project. The notes now identify `REQUIRE_HUMAN_APPROVAL=true` as the current setting, requiring human approval for repairs. The automatic restart described here belongs to the configuration used during that drill.

## A fault that restart could not fix

At the time, `orders-api` was classified as a tier 2 service eligible for a repair attempt. The injected fault was in the Deployment specification itself. Restarting would create Pods from the same broken configuration, leaving the cause intact.

The expected result was therefore a restart attempt followed by an honest failure report. Testing only faults that happen to recover after restart could let a verifier that always returns success go unnoticed.

The original notes preserved these contradictory outputs, with the Pod suffix already abbreviated:

```text
INFO:agent:done PodCrashLooping/orders-api action=restart verified=True outcome=verified

kubectl get pods:
orders-api-xxxx   0/1   CrashLoopBackOff
```

`action=restart` records what the agent attempted. `verified=True` makes a claim about the result. That second step was wrong.

## The healthy Pod belonged to the old version

During a rolling update, a Deployment can have old and new ReplicaSets at the same time. Each ReplicaSet maintains a group of Pod replicas. The new group scales up as the old group scales down, with the pace controlled by settings such as `maxSurge` and `maxUnavailable`. The [Kubernetes Deployment documentation](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment) describes those rules.

The misleading state recorded in the notes looked like this:

```text
orders-api Deployment
├─ Old ReplicaSet → Pod still Ready
└─ New ReplicaSet → Pod repeatedly crashing

Ask only “Is any Pod Ready?” → the old Pod can satisfy the check
```

The old verifier did not distinguish an existing healthy Pod from a completed update.

There is also a separate problem in the original PromQL recorded in the notes:

```text
count(kube_pod_status_ready{pod=~"orders-api-.*"} == 1) > 0
```

`kube_pod_status_ready` has a `condition` label with values `true`, `false` or `unknown`. Without selecting `condition="true"`, `== 1` can also match a series indicating that the not-ready condition holds. It does not necessarily mean Ready. See the [kube-state-metrics Pod metric definitions](https://github.com/kubernetes/kube-state-metrics/blob/main/docs/metrics/workload/pod-metrics.md).

Adding that condition would still allow a healthy old Pod to satisfy the check. The query also needs the appropriate namespace and workload scope, but tighter filtering alone cannot establish that a rollout completed.

## Record the state of the update being checked

The historical fix switched verification to Deployment status and recorded the details in `incident_steps`. It checked whether the controller had observed the change, along with updated, ready, available and unavailable replica counts.

That gets closer to the actual question. However, `readyReplicas` and `availableReplicas` are aggregate Deployment counts. They do not independently prove that every new-version Pod is healthy. Old and new replicas still coexisting must also be considered.

For a manual investigation, these two read-only commands provide a starting point. Replace the namespace with the one used by your environment:

```powershell
$namespace = "your-namespace"
kubectl -n $namespace get deployment orders-api -o yaml
kubectl -n $namespace rollout status deployment/orders-api --timeout=60s
```

The 60-second timeout is an example waiting limit, not a measured recovery time from this drill. By default, `rollout status` follows the latest rollout. If someone updates the Deployment again while it is being observed, check the revision too, so that another update's result is not attributed to the original repair.

Kubernetes defines a [complete Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#complete-deployment) in terms of updated and available replicas, with no old replicas still running. A completed rollout still needs a separate check that application requests succeed; Kubernetes status alone does not establish service recovery.

## The final result was failure

The final records in the notes show restart attempts for both `PodNotReady` and `TargetDown`. Both had `verified=false`, and both corresponding incidents had an outcome of `failed`. One recorded log line was:

```text
INFO:agent:done PodNotReady/orders-api action=restart verified=False outcome=failed
```

That matched the drill's expectation: restart had not removed the broken configuration, and the verifier no longer classified these two attempts as successful repairs. These results come from the existing drill notes; I did not inject the fault into the cloud environment again while preparing this article.

The case made me pay more attention to the evidence behind an agent's final result. Sending a command, completing a Deployment update and restoring successful requests each need their own checks. When two versions coexist, a healthy old Pod can easily hide a broken new one.
