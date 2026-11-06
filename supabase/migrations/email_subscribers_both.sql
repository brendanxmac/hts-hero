-- Tariff news "both": the weekly digest every Monday and each new action as it happens.
-- The weekly digest picks up 'weekly' and 'both'; the instant alerts 'instant' and 'both'
-- (libs/email/news-producer.ts activeSubscribers).
ALTER TABLE email_subscribers DROP CONSTRAINT IF EXISTS email_subscribers_news_frequency_check;
ALTER TABLE email_subscribers
  ADD CONSTRAINT email_subscribers_news_frequency_check CHECK (news_frequency IN ('instant', 'weekly', 'both', 'off'));
