import { RecordCard } from "../../components/RecordCard";
import { StatusBadge } from "../../components/StatusBadge";
import { Phase0JudgementCard } from "./Phase0JudgementCard";
import { createPhase0Judgement } from "./phase0-heuristics";
import type { Phase0MessyRecord } from "./phase0-types";

export function Phase0Workbench({
  records,
  selectedRecordId,
  onSelect,
  onUpdateRecord,
  onDeleteRecord,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
  onUpdateRecord?: (
    recordId: string,
    changes: Partial<Phase0MessyRecord>,
  ) => void;
  onDeleteRecord?: (recordId: string) => void;
}) {
  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0];

  const safetyBoundary = createPhase0Judgement(selectedRecord);

  return (
    <div className="workbench">
      <div className="workbench__intro">
        <p className="eyebrow">整理工作台</p>
        <h2>第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。</h2>
        <p>
          這裡先只標示安全邊界，真正的候選判斷要由小組和 coding agent
          補上；這不是 runtime LLM 分析，也不是正式資料模型。
        </p>
      </div>

      <div className="workbench__layout">
        <aside className="workbench__queue" aria-label="選擇原始資訊">
          {records.map((record) => (
            <div
              key={record.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <button
                className={record.id === selectedRecord.id ? "active" : ""}
                type="button"
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onClick={() => onSelect(record.id)}
              >
                <span>{record.id}</span>
                <StatusBadge status={record.verificationStatus} />
              </button>
              <button
                type="button"
                style={{
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border: "1px solid #dbe4ef",
                  background: "#f8f9fa",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (window.confirm(`確定要刪除 ${record.id} 嗎？`)) {
                    onDeleteRecord?.(record.id);
                  }
                }}
              >
                刪除
              </button>
            </div>
          ))}
        </aside>

        <div className="workbench__main">
          <RecordCard
            key={selectedRecord.id}
            record={selectedRecord}
            onUpdateRecord={onUpdateRecord}
          />

          <div style={{ margin: "12px 0" }}>
            <strong>驗證操作：</strong>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={() =>
                  onUpdateRecord?.(selectedRecord.id, {
                    verificationStatus: "verified",
                  })
                }
              >
                標為 verified
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateRecord?.(selectedRecord.id, {
                    verificationStatus: "needs_review",
                  })
                }
              >
                標為 needs_review
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateRecord?.(selectedRecord.id, {
                    verificationStatus: "unverified",
                  })
                }
              >
                標為 unverified
              </button>
            </div>
          </div>

          <Phase0JudgementCard
            key={`${selectedRecord.id}-judgement`}
            judgement={safetyBoundary}
            record={selectedRecord}
            onUpdateRecord={onUpdateRecord}
          />
        </div>

        <aside className="workbench__checklist">
          <h3>第一階段完成檢查</h3>
          <ul>
            <li>Starter 已載入 {records.length} 筆原始資訊</li>
            <li>請 agent 加上建立、編輯、刪除或重設整理草稿</li>
            <li>至少讓 6 筆原始資訊被嘗試整理成可編輯草稿</li>
            <li>至少挑 2 個候選判斷由人類質疑或修正</li>
            <li>
              把資料品質問題寫進 observations，並記錄 agent 哪裡不能直接相信
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
