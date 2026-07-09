export const QUALITY_ISSUE_LABELS: Record<string, string> = {
  ambiguous_location: '位置描述模糊',
  vague_counts: '數量不明確',
  no_late_timestamp: '缺少較晚時間點',
  uncertain_current_status: '目前狀態不確定',
  possible_outdated_info: '可能過時',
  unclear_counts: '數字不清楚',
  second_hand: '二手資訊',
  duplicate_possible: '可能重複回報',
  unknown_source_date: '來源日期不明',
  unverified_official_status: '官方未確認',
  conflicting_on_site_reports: '現場回報衝突',
  uncertain_safety: '安全性不明',
  stale_information: '資訊可能已失效',
  time_sensitive: '時間敏感',
  needs_recheck_at_timestamp: '需在時間點重查',
  personal_data: '包含個資',
  no_consent: '未取得同意',
  remote_report: '非現場回報',
  no_on_site_confirmation: '缺少現場確認',
  partial_access_rules: '存取規則不完整',
  no_official_confirmation: '無官方確認',
  unclear_reason: '原因不明',
  actionable_without_context: '缺乏背景難以採取行動',
};

export const QUALITY_ISSUE_COLORS: Record<string, string> = {
  ambiguous_location: '#fff3cd',
  vague_counts: '#fff3cd',
  no_late_timestamp: '#ffeeba',
  uncertain_current_status: '#ffeeba',
  possible_outdated_info: '#f8d7da',
  unclear_counts: '#fff3cd',
  second_hand: '#f1f3f5',
  duplicate_possible: '#f1f3f5',
  unknown_source_date: '#f8d7da',
  unverified_official_status: '#f8d7da',
  conflicting_on_site_reports: '#f8d7da',
  uncertain_safety: '#f8d7da',
  stale_information: '#f8d7da',
  time_sensitive: '#fff3cd',
  needs_recheck_at_timestamp: '#fff3cd',
  personal_data: '#f8d7da',
  no_consent: '#f8d7da',
  remote_report: '#f1f3f5',
  no_on_site_confirmation: '#fff3cd',
  partial_access_rules: '#ffeeba',
  no_official_confirmation: '#f8d7da',
  unclear_reason: '#f1f3f5',
  actionable_without_context: '#f8d7da',
};

export const QUALITY_ISSUE_SEVERITY: Record<string, "low" | "medium" | "high"> = {
  ambiguous_location: "medium",
  vague_counts: "medium",
  no_late_timestamp: "low",
  uncertain_current_status: "medium",
  possible_outdated_info: "medium",
  unclear_counts: "low",
  second_hand: "low",
  duplicate_possible: "low",
  unknown_source_date: "medium",
  unverified_official_status: "high",
  conflicting_on_site_reports: "high",
  uncertain_safety: "high",
  stale_information: "medium",
  time_sensitive: "medium",
  needs_recheck_at_timestamp: "low",
  personal_data: "high",
  no_consent: "high",
  remote_report: "low",
  no_on_site_confirmation: "medium",
  partial_access_rules: "medium",
  no_official_confirmation: "high",
  unclear_reason: "low",
  actionable_without_context: "high",
};

export const QUALITY_SEVERITY_COLORS: Record<string, string> = {
  high: '#f8d7da',
  medium: '#fff3cd',
  low: '#d1e7dd',
};

export function computeSeverityForIssues(issues: string[] | undefined): "low" | "medium" | "high" {
  if (!issues || issues.length === 0) return 'low';
  let severityRank = { high: 3, medium: 2, low: 1 };
  let best: "low" | "medium" | "high" = 'low';
  for (const q of issues) {
    const s = QUALITY_ISSUE_SEVERITY[q] ?? 'low';
    if (severityRank[s] > severityRank[best]) best = s;
    if (best === 'high') break;
  }
  return best;
}

