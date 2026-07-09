import { SourceLabel } from "../../components/SourceLabel";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/date";
import type { Phase0MessyRecord } from "./phase0-types";
import { QUALITY_ISSUE_LABELS, QUALITY_ISSUE_COLORS, QUALITY_SEVERITY_COLORS, resolveRecordSeverity } from "./quality-issues";

const RECORD_SEVERITY_GROUPS = [
  { key: 'high' as const, title: '品質高' },
  { key: 'medium' as const, title: '品質中' },
  { key: 'low' as const, title: '品質低' },
];

export function Phase0RawInfoPanel({
  records,
  selectedRecordId,
  onSelect,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
}) {
  const groupedRecords = records.reduce(
    (groups, record) => {
      const severity = resolveRecordSeverity(record);
      groups[severity].push(record);
      return groups;
    },
    { high: [] as Phase0MessyRecord[], medium: [] as Phase0MessyRecord[], low: [] as Phase0MessyRecord[] },
  );

  return (
    <div className="phase0-raw">
      <div className="panel__header">
        <div>
          <h2>原始資訊</h2>
          <p>這些還不是整理後資料，不能直接當成行動依據。</p>
        </div>
        <p>{records.length} 筆資料</p>
      </div>

      {RECORD_SEVERITY_GROUPS.map((group) => (
        <section key={group.key} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h3>{group.title}</h3>
            <span style={{ color: '#495057', fontSize: 14 }}>{groupedRecords[group.key].length} 筆</span>
          </div>

          {groupedRecords[group.key].length === 0 ? (
            <p style={{ color: '#6c757d', marginTop: 8 }}>目前沒有符合該品質分類的原始資訊。</p>
          ) : (
            <div className="grid">
              {groupedRecords[group.key].map((record) => (
                <article
                  className={`record-card ${record.id === selectedRecordId ? "record-card--selected" : ""}`}
                  key={record.id}
                >
                  <div className="record-card__header">
                    <h3>{record.id}</h3>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <StatusBadge status={record.verificationStatus} />
                      <span style={{ padding: '2px 6px', background: QUALITY_SEVERITY_COLORS[group.key] ?? '#e9ecef', borderRadius: 4, fontSize: 12 }}>
                        {group.title}
                      </span>
                    </div>
                  </div>
                  <p>{record.rawText}</p>
                  <div className="record-card__meta">
                    <SourceLabel sourceType={record.sourceType} />
                    <span>更新：{formatDateTime(record.updatedAt)}</span>
                  </div>
                  {record.annotationsNeeded && record.annotationsNeeded.length > 0 ? (
                    <div style={{ marginTop: 8 }}>
                      {record.annotationsNeeded.map((a) => (
                        <span key={a} style={{ marginRight: 6, padding: '2px 6px', background: '#fff3cd', borderRadius: 4, fontSize: 12 }}>
                          需確認：{a}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {record.qualityIssues && record.qualityIssues.length > 0 ? (
                    <div style={{ marginTop: 8 }}>
                      {record.qualityIssues.map((q) => (
                        <span key={q} style={{ marginRight: 6, padding: '2px 6px', background: QUALITY_ISSUE_COLORS[q] ?? '#e9ecef', borderRadius: 4, fontSize: 12 }}>
                          {QUALITY_ISSUE_LABELS[q] ?? q}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {record.sensitive ? (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ color: '#721c24', background: '#f8d7da', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>敏感資訊</span>
                    </div>
                  ) : null}

                  <button type="button" onClick={() => onSelect(record.id)}>
                    送到整理工作台
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
