// The refund milestones on the refund timeline, numbered on the chart (RefundTimeline); the legend
// under it (RefundGroups) gives each one's date and meaning. Plain data, so the server-rendered
// legend and the client-rendered chart share it. From tariffs/engine-v2/REFUNDS.md (checked Oct 10, 2026).

export const TIMELINE_EVENTS = [
  { at: "2026-02-20", date: "Feb 20, 2026", label: "Supreme Court holds IEEPA doesn't authorize tariffs" },
  { at: "2026-04-20", date: "Apr 20, 2026", label: "CBP opens IEEPA refunds in ACE (CAPE)" },
  { at: "2026-05-07", date: "May 7, 2026", label: "Court of International Trade holds Section 122 invalid" },
  { at: "2026-06-11", date: "Jun 11, 2026", label: "Federal Circuit stays that ruling during the appeal" },
];
