-- What applied to each audited entry when it was filed: the answers to the calculator's questions
-- (exemptions confirmed, content percentages, dates), set in the entry audit's Check & Adjust step.
-- Together with claimed_preference (already on the table), they can differ from the import's
-- settings today. NULL on entries logged before this: those are checked with the import's settings.
ALTER TABLE tracker_entries ADD COLUMN IF NOT EXISTS answers jsonb;

-- The AD/CVD cases on the entry (the entry audit's AD/CVD step): each with whether it covers the
-- goods, the supplier and the deposit rate used, and the AD/CVD deposits paid on the line.
-- {"cases":[{"key","product","caseNumbers":[],"answer","supplier","ratePct","source"}],"paid":0}.
-- NULL on entries logged before it: no AD/CVD in their check.
ALTER TABLE tracker_entries ADD COLUMN IF NOT EXISTS adcvd jsonb;
