import { SourceLabel } from "../../components/SourceLabel";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/date";
import type { Phase0MessyRecord } from "./phase0-types";
import { QUALITY_ISSUE_LABELS, QUALITY_ISSUE_COLORS, QUALITY_SEVERITY_COLORS, resolveRecordSeverity } from "./quality-issues";

export function Phase0RawInfoPanel({
  records,
  selectedRecordId,
  onSelect,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
}) {
  return (
    <div className="phase0-raw">
      <div className="panel__header">
        <div>
          <h2>原始資訊</h2>
          <p>這些還不是整理後資料，不能直接當成行動依據。</p>
        </div>
        <p>{records.length} 筆資料</p>
      </div>

      <div className="grid">
        {records.map((record) => (
          <article
            className={`record-card ${record.id === selectedRecordId ? "record-card--selected" : ""}`}
            key={record.id}
          >
            <div className="record-card__header">
              <h3>{record.id}</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <StatusBadge status={record.verificationStatus} />
                {(record.qualityIssues && record.qualityIssues.length > 0) || record.qualitySeverity ? (
                  (() => {
                    const sev = resolveRecordSeverity(record);
                    const label = sev === 'high' ? '品質：高' : sev === 'medium' ? '品質：中' : '品質：低';
                    return (
                      <span style={{ padding: '2px 6px', background: QUALITY_SEVERITY_COLORS[sev] ?? '#e9ecef', borderRadius: 4, fontSize: 12 }}>
                        {label}
                      </span>
                    );
                  })()
                ) : null}
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
    </div>
  );
}
