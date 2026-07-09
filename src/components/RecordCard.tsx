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

export function RecordCard({ record }: { record: RecordLike }) {
  const title = record.title ?? record.name ?? record.id;
  const description = record.rawText ?? record.description;
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
    </article>
  );
}
