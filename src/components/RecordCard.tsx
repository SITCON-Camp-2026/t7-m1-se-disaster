import { useState, useEffect } from "react";
import { SourceLabel } from "./SourceLabel";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime } from "../lib/date";
import { QUALITY_ISSUE_LABELS, QUALITY_ISSUE_COLORS, QUALITY_SEVERITY_COLORS, resolveRecordSeverity } from "../features/phase-0/quality-issues";
import type { Phase0MessyRecord } from "../features/phase-0/phase0-types";

type RecordLike = Phase0MessyRecord & {
  title?: string;
  name?: string;
  description?: string;
};

export function RecordCard({ record, onUpdateRecord }: { record: RecordLike; onUpdateRecord?: (recordId: string, changes: Partial<RecordLike>) => void; }) {
  const title = record.title ?? record.name ?? record.id;
  const description = record.rawText ?? record.description;
  const recordQualitySeverity = record.qualitySeverity;
  const [selectedSeverity, setSelectedSeverity] = useState(recordQualitySeverity ?? "");
  const [rawTextValue, setRawTextValue] = useState(record.rawText ?? "");

  useEffect(() => {
    setSelectedSeverity(recordQualitySeverity ?? "");
    setRawTextValue(record.rawText ?? "");
  }, [record.id, recordQualitySeverity, record.rawText]);
  return (
    <article className="record-card">
      <div className="record-card__header">
        <h3>{title}</h3>
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
      {description ? <p>{description}</p> : null}
      <div className="record-card__meta">
        <SourceLabel sourceType={record.sourceType} />
        <span>更新：{formatDateTime(record.updatedAt)}</span>
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="raw-text-input" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
          原始資訊內容
        </label>
        <textarea
          id="raw-text-input"
          value={rawTextValue}
          onChange={(event) => setRawTextValue(event.target.value)}
          rows={6}
          style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ced4da' }}
        />
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              onUpdateRecord?.(record.id, { rawText: rawTextValue } as any);
            }}
          >
            儲存原始內容
          </button>
          <button
            type="button"
            onClick={() => setRawTextValue(record.rawText ?? "")}
          >
            重設內容
          </button>
        </div>
      </div>

      {record.annotationsNeeded && record.annotationsNeeded.length > 0 ? (
        <div className="record-card__annotations" style={{ marginTop: 8 }}>
          {record.annotationsNeeded.map((a) => (
            <span key={a} className="annotation-badge" style={{ marginRight: 6, padding: '2px 6px', background: '#fff3cd', borderRadius: 4, fontSize: 12 }}>
              需確認：{a}
            </span>
          ))}
        </div>
      ) : null}

      {record.sensitive ? (
        <div style={{ marginTop: 8 }}>
          <span style={{ color: '#721c24', background: '#f8d7da', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>敏感資訊，需取得當事人同意</span>
        </div>
      ) : null}

      {record.qualityIssues && record.qualityIssues.length > 0 ? (
        <div style={{ marginTop: 8 }}>
          {record.qualityIssues.map((q: string) => (
            <span key={q} style={{ marginRight: 6, padding: '2px 6px', background: QUALITY_ISSUE_COLORS[q] ?? '#e9ecef', borderRadius: 4, fontSize: 12 }}>
              {QUALITY_ISSUE_LABELS[q] ?? q}
            </span>
          ))}
        </div>
      ) : null}

      <div style={{ marginTop: 12 }}>
        <label htmlFor="quality-severity" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
          編輯資料品質
        </label>
        <select
          id="quality-severity"
          value={selectedSeverity}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedSeverity(value);
            onUpdateRecord?.(record.id, { qualitySeverity: value || undefined } as any);
          }}
          style={{ padding: '8px', width: '100%', borderRadius: 6, border: '1px solid #ced4da' }}
        >
          <option value="">未指定</option>
          <option value="high">品質高</option>
          <option value="medium">品質中</option>
          <option value="low">品質低</option>
        </select>
      </div>
    </article>
  );
}
