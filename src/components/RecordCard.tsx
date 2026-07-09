import { useState } from "react";
import { SourceLabel } from "./SourceLabel";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime } from "../lib/date";

type RecordLike = {
  id: string;
  title?: string;
  name?: string;
  rawText?: string;
  description?: string;
  sourceType: string;
  verificationStatus: string;
  updatedAt: string;
  annotationsNeeded?: string[];
  sensitive?: boolean;
};

export function RecordCard({ record, onUpdateRecord }: { record: RecordLike; onUpdateRecord?: (recordId: string, changes: Partial<RecordLike>) => void; }) {
  const title = record.title ?? record.name ?? record.id;
  const description = record.rawText ?? record.description;
  const initialDraft = (record as any).draft ?? null;
  const [draftContent, setDraftContent] = useState(initialDraft?.content ?? "");
  return (
    <article className="record-card">
      <div className="record-card__header">
        <h3>{title}</h3>
        <StatusBadge status={record.verificationStatus} />
      </div>
      {description ? <p>{description}</p> : null}
      <div className="record-card__meta">
        <SourceLabel sourceType={record.sourceType} />
        <span>更新：{formatDateTime(record.updatedAt)}</span>
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

      {initialDraft ? (
        <div style={{ marginTop: 12 }}>
          <h4>整理草稿</h4>
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            rows={6}
            style={{ width: '100%', padding: 8 }}
          />
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                onUpdateRecord?.(record.id, {
                  draft: {
                    ...(initialDraft as any),
                    content: draftContent,
                    lastEditedAt: new Date().toISOString(),
                    lastEditedBy: 'local'
                  }
                } as any);
              }}
            >
              儲存草稿
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftContent(initialDraft.content ?? "");
                onUpdateRecord?.(record.id, { draft: { ...(initialDraft as any), content: initialDraft.content, lastEditedAt: initialDraft.lastEditedAt, lastEditedBy: initialDraft.lastEditedBy } } as any);
              }}
            >
              重設
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
