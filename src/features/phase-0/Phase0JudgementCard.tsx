import { useState, useEffect } from "react";
import { StatusBadge } from "../../components/StatusBadge";
import type { Phase0JudgementDraft, Phase0MessyRecord } from "./phase0-types";

const kindLabels: Record<Phase0JudgementDraft["possibleKind"], string> = {
  help_request_candidate: "求助候選",
  site_status_candidate: "地點狀態候選",
  task_candidate: "任務候選",
  assignment_candidate: "人員指派候選",
  announcement_candidate: "公告候選",
  unknown: "候選類型待判斷",
};

const confidenceLabels: Record<Phase0JudgementDraft["confidence"], string> = {
  low: "低",
  medium: "中",
  high: "高",
};

const nextStepLabels: Record<
  Phase0JudgementDraft["suggestedNextStep"],
  string
> = {
  keep_raw: "先保留原始資訊",
  ask_for_more_info: "補問來源或現場資訊",
  send_to_human_review: "交給人工確認",
  create_candidate_report: "建立候選通報",
  create_site_update_suggestion: "建立地點更新建議",
  do_not_use_yet: "暫時不要使用",
};

export function Phase0JudgementCard({
  judgement,
  record,
  onUpdateRecord,
}: {
  judgement: Phase0JudgementDraft;
  record: Phase0MessyRecord;
  onUpdateRecord?: (recordId: string, changes: Partial<Phase0MessyRecord>) => void;
}) {
  const initial = record.draftJudgement ?? null;
  const [draft, setDraft] = useState<Phase0JudgementDraft | null>(initial ?? null);

  useEffect(() => {
    setDraft(record.draftJudgement ?? null);
  }, [record.id, record.draftJudgement]);
  return (
    <article className="judgement-card">
      <div className="judgement-card__header">
        <div>
          <p className="eyebrow">Starter 安全預設</p>
          <h3>尚未建立整理草稿</h3>
        </div>
        <StatusBadge status={record.verificationStatus} />
      </div>

      <p>
        這張卡只保留保守的安全邊界，不是 agent 對這筆資料的整理答案。請讓 coding
        agent 實作可建立、編輯與刪除的整理草稿。
      </p>

      <dl className="judgement-summary">
        <div>
          <dt>候選類型</dt>
          <dd>{kindLabels[judgement.possibleKind]}</dd>
        </div>
        <div>
          <dt>信心程度</dt>
          <dd>{confidenceLabels[judgement.confidence]}</dd>
        </div>
        <div>
          <dt>下一步</dt>
          <dd>{nextStepLabels[judgement.suggestedNextStep]}</dd>
        </div>
      </dl>

      <p>
        能否直接行動：
        <strong>
          {judgement.unsafeToActDirectly ? "不可直接行動" : "仍需確認情境"}
        </strong>
      </p>

      <section>
        <h4>目前只有安全預設</h4>
        <ul>
          {judgement.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>目前卡住的地方</h4>
        <ul>
          {judgement.blockers.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 12 }}>
        <h4>人工整理草稿</h4>
        {draft ? (
          <div>
            <label>
              候選類型
              <select value={draft.possibleKind} onChange={(e) => setDraft({ ...draft, possibleKind: e.target.value as Phase0JudgementDraft["possibleKind"] })}>
                {(Object.entries(kindLabels) as Array<[Phase0JudgementDraft["possibleKind"], string]>).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              信心程度
              <select value={draft.confidence} onChange={(e) => setDraft({ ...draft, confidence: e.target.value as Phase0JudgementDraft["confidence"] })}>
                {(Object.entries(confidenceLabels) as Array<[Phase0JudgementDraft["confidence"], string]>).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              下一步
              <select value={draft.suggestedNextStep} onChange={(e) => setDraft({ ...draft, suggestedNextStep: e.target.value as Phase0JudgementDraft["suggestedNextStep"] })}>
                {(Object.entries(nextStepLabels) as Array<[Phase0JudgementDraft["suggestedNextStep"], string]>).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              人類審查註記
              <textarea value={draft.humanReviewNote ?? ""} onChange={(e) => setDraft({ ...draft, humanReviewNote: e.target.value })} rows={4} style={{ width: '100%' }} />
            </label>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => onUpdateRecord?.(record.id, { draftJudgement: draft } as any)}>儲存判斷草稿</button>
              <button type="button" onClick={() => { setDraft(null); onUpdateRecord?.(record.id, { draftJudgement: undefined } as any); }}>刪除判斷草稿</button>
              <button type="button" onClick={() => setDraft((record as any).draftJudgement ?? null)}>重設</button>
            </div>
          </div>
        ) : (
          <div>
            <button type="button" onClick={() => {
              const newDraft: Phase0JudgementDraft = {
                messyRecordId: record.id,
                possibleKind: judgement.possibleKind,
                confidence: judgement.confidence,
                evidence: judgement.evidence,
                blockers: judgement.blockers,
                suggestedNextStep: judgement.suggestedNextStep,
                unsafeToActDirectly: judgement.unsafeToActDirectly,
                humanReviewNote: ''
              };
              setDraft(newDraft);
              onUpdateRecord?.(record.id, { draftJudgement: newDraft } as any);
            }}>建立判斷草稿</button>
          </div>
        )}
      </section>
    </article>
  );
}
