import { useMemo, useState } from "react";
import { SourceLabel } from "../../components/SourceLabel";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/date";
import type { Phase0MessyRecord } from "../phase-0/phase0-types";

type FlowGate = {
  key: string;
  label: string;
  state: "ok" | "needs_review";
  note: string;
};

type FlowDecision = {
  route: "candidate" | "manual_review" | "defer";
  title: string;
  description: string;
};

type ReviewDraft = {
  reviewer: string;
  result: "未確認" | "候選結果" | "暫不採用";
  reason: string;
};

const conflictIssues = new Set([
  "actionable_without_context",
  "conflicting_on_site_reports",
  "duplicate_possible",
  "no_late_timestamp",
  "no_official_confirmation",
  "no_on_site_confirmation",
  "possible_outdated_info",
  "stale_information",
  "unknown_source_date",
  "unclear_reason",
  "uncertain_current_status",
  "uncertain_safety",
]);

const issueLabels: Record<string, string> = {
  actionable_without_context: "缺少可行動脈絡",
  ambiguous_location: "地點模糊",
  conflicting_on_site_reports: "現場回報互相衝突",
  duplicate_possible: "可能與其他資訊重複",
  no_consent: "尚未取得同意",
  no_late_timestamp: "缺少較晚時間戳",
  no_official_confirmation: "未見官方同步確認",
  no_on_site_confirmation: "缺少現場確認",
  partial_access_rules: "規則只被部分說明",
  personal_data: "含個資或敏感內容",
  possible_outdated_info: "可能已過期",
  remote_report: "非現場轉述",
  second_hand: "二手資訊",
  stale_information: "過期名單風險",
  time_sensitive: "具時效性",
  uncertain_current_status: "目前狀態不明",
  uncertain_safety: "安全狀況未確認",
  unclear_counts: "數量不明",
  unclear_reason: "原因不明",
  unknown_source_date: "來源日期不明",
  unverified_official_status: "官方狀態未確認",
  vague_counts: "數量描述模糊",
  needs_recheck_at_timestamp: "需在指定時間重查",
};

const annotationLabels: Record<string, string> = {
  access_rules: "進出規則",
  consent: "當事人同意",
  contact_followup: "聯絡追蹤",
  counts: "數量",
  exact_address: "精確位置",
  inventory: "庫存",
  location: "地點",
  location_confirmation: "位置確認",
  official_confirm: "官方確認方式",
  official_sync: "官方同步",
  source_date: "來源日期",
  timestamp: "時間",
};

function labelList(
  values: string[] | undefined,
  labels: Record<string, string>,
) {
  if (!values || values.length === 0) return "沒有明確標註";
  return values.map((value) => labels[value] ?? value).join("、");
}

function buildFlowGates(record: Phase0MessyRecord): FlowGate[] {
  const qualityIssues = record.qualityIssues ?? [];
  const annotationsNeeded = record.annotationsNeeded ?? [];
  const hasConflict = qualityIssues.some((issue) => conflictIssues.has(issue));
  const needsVerification = record.verificationStatus !== "verified";

  return [
    {
      key: "source",
      label: "保留來源",
      state: record.sourceType ? "ok" : "needs_review",
      note: record.sourceType
        ? "已保留資訊取得方式；這不代表已查核。"
        : "缺少資訊取得方式，需補來源。",
    },
    {
      key: "time",
      label: "保留收到時間",
      state: record.updatedAt ? "ok" : "needs_review",
      note: record.updatedAt
        ? `收到或更新時間：${formatDateTime(record.updatedAt)}`
        : "缺少收到時間，無法判斷是否過期。",
    },
    {
      key: "fields",
      label: "關鍵欄位完整度",
      state: annotationsNeeded.length === 0 ? "ok" : "needs_review",
      note:
        annotationsNeeded.length === 0
          ? "目前 fixture 沒有標註缺漏欄位，仍需人工閱讀原文。"
          : `需要補：${labelList(annotationsNeeded, annotationLabels)}`,
    },
    {
      key: "conflict",
      label: "衝突與上下文",
      state: hasConflict ? "needs_review" : "ok",
      note: hasConflict
        ? `需要釐清：${labelList(
            qualityIssues.filter((issue) => conflictIssues.has(issue)),
            issueLabels,
          )}`
        : "沒有被 fixture 標註為明顯衝突；仍不可視為事實。",
    },
    {
      key: "verification",
      label: "人工確認",
      state: needsVerification ? "needs_review" : "ok",
      note: needsVerification
        ? "目前不是已確認資訊，不能直接建立可執行任務。"
        : "即使已確認，也要由人工判斷是否適合成為任務。",
    },
  ];
}

function decideFlow(
  record: Phase0MessyRecord,
  gates: FlowGate[],
): FlowDecision {
  const informationNeedsReview = gates.some(
    (gate) => gate.key !== "verification" && gate.state === "needs_review",
  );

  if (record.sensitive) {
    return {
      route: "defer",
      title: "暫不採用",
      description: "含敏感資訊或同意問題，先保留原文與判斷理由，不建立任務。",
    };
  }

  if (informationNeedsReview) {
    return {
      route: "manual_review",
      title: "需要人工確認",
      description: "缺少欄位、查核狀態或上下文，暫時不建立候選任務。",
    };
  }

  return {
    route: "candidate",
    title: "可建立候選結果",
    description:
      "資訊看起來足夠整理成候選結果，但仍未經人工確認，不是可執行任務。",
  };
}

function createInitialDrafts(records: Phase0MessyRecord[]) {
  return Object.fromEntries(
    records.map((record) => [
      record.id,
      {
        reviewer: "",
        result: "未確認",
        reason: record.reviewNotes ?? "尚待人工補上採用或暫不採用理由。",
      } satisfies ReviewDraft,
    ]),
  );
}

function routeClass(route: FlowDecision["route"]) {
  return `v1-route v1-route--${route}`;
}

export function V1FlowWorkbench({ records }: { records: Phase0MessyRecord[] }) {
  const [selectedRecordId, setSelectedRecordId] = useState(
    records[0]?.id ?? "",
  );
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>(() =>
    createInitialDrafts(records),
  );

  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0];

  const summaries = useMemo(
    () =>
      records.map((record) => {
        const gates = buildFlowGates(record);
        return {
          record,
          decision: decideFlow(record, gates),
          reviewCount: gates.filter((gate) => gate.state === "needs_review")
            .length,
        };
      }),
    [records],
  );

  if (!selectedRecord) {
    return <p>目前沒有 Phase 0 原始資訊可檢視。</p>;
  }

  const selectedGates = buildFlowGates(selectedRecord);
  const selectedDecision = decideFlow(selectedRecord, selectedGates);
  const selectedDraft = drafts[selectedRecord.id] ?? {
    reviewer: "",
    result: "未確認",
    reason: "",
  };
  const routeCounts = summaries.reduce(
    (counts, item) => {
      counts[item.decision.route] += 1;
      return counts;
    },
    { candidate: 0, defer: 0, manual_review: 0 },
  );

  function updateDraft(changes: Partial<ReviewDraft>) {
    setDrafts((current) => ({
      ...current,
      [selectedRecord.id]: {
        ...selectedDraft,
        ...changes,
      },
    }));
  }

  return (
    <main className="layout v1-layout">
      <header className="hero v1-hero">
        <div>
          <p className="eyebrow">v1 flow workbench</p>
          <h1>行動前資訊檢查工作台</h1>
          <p>
            依照 `flow.md`，先保存 Phase 0
            原始資訊，再檢查欄位、衝突與查核狀態。
            候選結果仍需要人工確認；這裡不建立已確認任務。
          </p>
        </div>
        <a className="v1-home-link" href="/">
          回到 Phase 0
        </a>
      </header>

      <section className="v1-summary" aria-label="v1 流程摘要">
        <div>
          <strong>{records.length}</strong>
          <span>Phase 0 原始資訊</span>
        </div>
        <div>
          <strong>{routeCounts.manual_review}</strong>
          <span>需要人工確認</span>
        </div>
        <div>
          <strong>{routeCounts.candidate}</strong>
          <span>候選結果，不是任務</span>
        </div>
        <div>
          <strong>{routeCounts.defer}</strong>
          <span>暫不採用或待補充</span>
        </div>
      </section>

      <section className="v1-workbench" aria-label="v1 前端工作台">
        <aside className="v1-list" aria-label="原始資訊佇列">
          <div className="v1-section-heading">
            <p className="eyebrow">raw queue</p>
            <h2>原始資訊佇列</h2>
          </div>
          {summaries.map(({ record, decision, reviewCount }) => (
            <button
              key={record.id}
              className={record.id === selectedRecord.id ? "active" : ""}
              type="button"
              onClick={() => setSelectedRecordId(record.id)}
            >
              <span>
                <strong>{record.id}</strong>
                <small>{decision.title}</small>
              </span>
              <em>{reviewCount} 項待確認</em>
            </button>
          ))}
        </aside>

        <div className="v1-detail">
          <article className="v1-raw-card">
            <div className="record-card__header">
              <div>
                <p className="eyebrow">preserved raw input</p>
                <h2>{selectedRecord.id}</h2>
              </div>
              <StatusBadge status={selectedRecord.verificationStatus} />
            </div>
            <p>{selectedRecord.rawText}</p>
            <div className="record-card__meta">
              <SourceLabel sourceType={selectedRecord.sourceType} />
              <span>
                收到或更新：{formatDateTime(selectedRecord.updatedAt)}
              </span>
            </div>
          </article>

          <article className="v1-flow-card">
            <div className="v1-section-heading">
              <p className="eyebrow">flow gates</p>
              <h2>流程檢查</h2>
            </div>
            <ol className="v1-gates">
              {selectedGates.map((gate) => (
                <li key={gate.key} className={`v1-gate v1-gate--${gate.state}`}>
                  <span>{gate.state === "ok" ? "可讀取" : "需確認"}</span>
                  <div>
                    <strong>{gate.label}</strong>
                    <p>{gate.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>
        </div>

        <aside className="v1-review" aria-label="人工確認紀錄">
          <div className={routeClass(selectedDecision.route)}>
            <span>目前分支</span>
            <strong>{selectedDecision.title}</strong>
            <p>{selectedDecision.description}</p>
          </div>

          <div className="v1-review-form">
            <div className="v1-section-heading">
              <p className="eyebrow">human review</p>
              <h2>人工判斷紀錄</h2>
            </div>
            <label>
              判斷者
              <input
                value={selectedDraft.reviewer}
                onChange={(event) =>
                  updateDraft({ reviewer: event.target.value })
                }
                placeholder="例如：小組成員姓名"
              />
            </label>
            <label>
              人工確認結果
              <select
                value={selectedDraft.result}
                onChange={(event) =>
                  updateDraft({
                    result: event.target.value as ReviewDraft["result"],
                  })
                }
              >
                <option value="未確認">未確認</option>
                <option value="候選結果">候選結果</option>
                <option value="暫不採用">暫不採用</option>
              </select>
            </label>
            <label>
              判斷理由
              <textarea
                value={selectedDraft.reason}
                onChange={(event) =>
                  updateDraft({ reason: event.target.value })
                }
                rows={6}
              />
            </label>
            <p className="v1-review-note">
              這份紀錄只存在本頁狀態中，供課堂檢視流程；未確認內容不會被保存成整理後資料。
            </p>
          </div>

          <div className="v1-evidence">
            <h3>不能直接變成任務的理由</h3>
            <ul>
              {(selectedRecord.qualityIssues ?? []).length > 0 ? (
                selectedRecord.qualityIssues?.map((issue) => (
                  <li key={issue}>{issueLabels[issue] ?? issue}</li>
                ))
              ) : (
                <li>沒有足夠人工確認紀錄，不能直接派工。</li>
              )}
              {selectedRecord.sensitive ? (
                <li>含敏感資訊，需先確認同意。</li>
              ) : null}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
