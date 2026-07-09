import { useMemo, useState } from "react";
import messyReports from "../fixtures/phase-0/messy-reports.json";
import { EmptyState } from "../components/EmptyState";
import { Phase0RawInfoPanel } from "../features/phase-0/Phase0RawInfoPanel";
import { Phase0Workbench } from "../features/phase-0/Phase0Workbench";
import type { Phase0MessyRecord } from "../features/phase-0/phase0-types";
import { resolveRecordSeverity } from "../features/phase-0/quality-issues";
import { SourceLabel } from "../components/SourceLabel";
import { StatusBadge } from "../components/StatusBadge";
import { formatDateTime } from "../lib/date";

type TabKey = "raw" | "workbench";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "raw", label: "原始資訊" },
  { key: "workbench", label: "整理工作台" },
];

const phase0Records = messyReports satisfies Phase0MessyRecord[];

export function App() {
  const isV1Route = typeof window !== "undefined" && window.location.pathname.startsWith("/v1");
  const [activeTab, setActiveTab] = useState<TabKey>("raw");
  const [records, setRecords] = useState<Phase0MessyRecord[]>(
    () => phase0Records.map((r) => ({ ...r })),
  );
  const [selectedRecordId, setSelectedRecordId] = useState(
    records[0]?.id ?? "",
  );
  const [newRecordText, setNewRecordText] = useState("");
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);

  function selectForWorkbench(recordId: string) {
    setSelectedRecordId(recordId);
    setActiveTab("workbench");
  }

  function updateRecord(recordId: string, changes: Partial<Phase0MessyRecord>) {
    setRecords((prev) => prev.map((r) => (r.id === recordId ? { ...r, ...changes } : r)));
  }

  function deleteRecord(recordId: string) {
    setRecords((prev) => {
      const nextRecords = prev.filter((record) => record.id !== recordId);
      if (selectedRecordId === recordId) {
        setSelectedRecordId(nextRecords[0]?.id ?? "");
      }
      return nextRecords;
    });
  }

  function getNextRecordId(existingRecords: Phase0MessyRecord[]) {
    const currentNumbers = existingRecords
      .map((record) => {
        const match = record.id.match(/^M-(\d+)$/);
        return match ? Number(match[1]) : NaN;
      })
      .filter((value) => !Number.isNaN(value));

    const maxExisting = currentNumbers.length > 0 ? Math.max(...currentNumbers) : 0;
    const nextNumber = Math.max(maxExisting + 1, 13);

    return `M-${String(nextNumber).padStart(3, "0")}`;
  }

  function addRecord() {
    setIsCreatingRecord(true);
  }

  function cancelCreateRecord() {
    setIsCreatingRecord(false);
    setNewRecordText("");
  }

  function createRecord() {
    if (!newRecordText.trim()) {
      window.alert("請先輸入新增資料內容，再按送出新增。");
      return;
    }

    if (!window.confirm("確定要新增這筆資料嗎？按取消將不會新增。")) {
      return;
    }

    const newRecordId = getNextRecordId(records);
    const newRecord: Phase0MessyRecord = {
      id: newRecordId,
      rawText: newRecordText,
      sourceType: "不明來源",
      updatedAt: new Date().toISOString(),
      verificationStatus: "unverified",
      annotationsNeeded: [],
      qualityIssues: [],
      sensitive: false,
    };

    setRecords((prev) => [...prev, newRecord]);
    setSelectedRecordId(newRecord.id);
    setActiveTab("workbench");
    setNewRecordText("");
    setIsCreatingRecord(false);
  }

  const v1Summary = useMemo(() => {
    return records.map((record) => ({
      ...record,
      severity: resolveRecordSeverity(record),
    }));
  }, [records]);

  if (isV1Route) {
    return (
      <main className="layout">
        <header className="hero">
          <p className="eyebrow">SITCON Camp 2026</p>
          <h1>V1 版整理檢視</h1>
          <p>
            資料來源仍來自 Phase 0 原始資訊；未確認內容會明確標示為需要人工確認，不能直接當成已確認任務。
          </p>
        </header>

        <section className="panel">
          <div className="panel__header">
            <div>
              <h2>整理檢視</h2>
              <p>這個版本專注於讓使用者看見來源、查核狀態與需要確認的地方。</p>
            </div>
            <p>{records.length} 筆原始資訊</p>
          </div>

          <div className="grid">
            {v1Summary.map((record) => (
              <article key={record.id} className="record-card">
                <div className="record-card__header">
                  <h3>{record.id}</h3>
                  <StatusBadge status={record.verificationStatus} />
                </div>
                <p>{record.rawText}</p>
                <div className="record-card__meta">
                  <SourceLabel sourceType={record.sourceType} />
                  <span>更新：{formatDateTime(record.updatedAt)}</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ marginRight: 6, padding: "2px 6px", background: "#fff3cd", borderRadius: 4, fontSize: 12 }}>
                    來源：{record.sourceType}
                  </span>
                  <span style={{ marginRight: 6, padding: "2px 6px", background: "#e9ecef", borderRadius: 4, fontSize: 12 }}>
                    品質：{record.severity === "high" ? "高" : record.severity === "medium" ? "中" : "低"}
                  </span>
                </div>
                {record.annotationsNeeded && record.annotationsNeeded.length > 0 ? (
                  <div style={{ marginTop: 8 }}>
                    {record.annotationsNeeded.map((item) => (
                      <span key={item} style={{ marginRight: 6, padding: "2px 6px", background: "#fff3cd", borderRadius: 4, fontSize: 12 }}>
                        需確認：{item}
                      </span>
                    ))}
                  </div>
                ) : null}
                {record.qualityIssues && record.qualityIssues.length > 0 ? (
                  <div style={{ marginTop: 8 }}>
                    {record.qualityIssues.map((item) => (
                      <span key={item} style={{ marginRight: 6, padding: "2px 6px", background: "#f8d7da", borderRadius: 4, fontSize: 12 }}>
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="layout">
      <header className="hero">
        <p className="eyebrow">SITCON Camp 2026</p>
        <h1>災害資訊整理工作台</h1>
        <p>
          第一階段先用 coding agent
          做出可展示的前端原型，再從成果中看見資料品質、角色、狀態與來源的限制。
        </p>
      </header>

      <nav className="tabs" aria-label="第一階段工作區">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
        <button
          type="button"
          className={`tab-add-button ${isCreatingRecord ? 'tab-add-button--active' : ''}`}
          onClick={addRecord}
        >
          新增資料
        </button>
      </nav>
      {isCreatingRecord ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <label htmlFor="new-record-content" style={{ fontWeight: 600 }}>
            新增資料內容
          </label>
          <textarea
            id="new-record-content"
            className="new-record-input"
            value={newRecordText}
            onChange={(event) => setNewRecordText(event.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 12,
              border: '1px solid #cfd8e3',
              backgroundColor: '#ffffff',
              color: '#000000',
              caretColor: '#000000',
              fontFamily: 'inherit',
              fontSize: 16,
              lineHeight: 1.5,
            }}
            placeholder="請在這裡輸入要新增的原始資訊內容"
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={createRecord}>
              送出新增
            </button>
            <button type="button" onClick={cancelCreateRecord}>
              取消
            </button>
          </div>
        </div>
      ) : null}

      <section className="panel">
        {records.length === 0 ? (
          <EmptyState message="目前沒有資料" />
        ) : activeTab === "raw" ? (
          <Phase0RawInfoPanel
            records={records}
            selectedRecordId={selectedRecordId}
            onSelect={selectForWorkbench}
          />
        ) : (
          <Phase0Workbench
            records={records}
            selectedRecordId={selectedRecordId}
            onSelect={setSelectedRecordId}
            onUpdateRecord={updateRecord}
            onDeleteRecord={deleteRecord}
          />
        )}
      </section>
    </main>
  );
}
