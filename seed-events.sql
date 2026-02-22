-- Seed events for Monto Content Studio
-- Run this in your Supabase SQL Editor
-- Covers Feb 2026 through Dec 2026 with national days, holidays, industry events, and historical milestones

-- Clear existing auto-seeded events (keep manual ones)
DELETE FROM events WHERE source = 'auto';

INSERT INTO events (name, date, category, description, source, relevance_tags) VALUES
  -- FEBRUARY 2026
  ('National Data Privacy Day (observed week)', '2026-02-23', 'industry', 'Awareness week for data privacy — great for security/compliance content', 'auto', ARRAY['security','compliance','data']),

  -- MARCH 2026
  ('International Women''s Day', '2026-03-08', 'holiday', 'Celebrate women in fintech and leadership', 'auto', ARRAY['culture','diversity','leadership']),
  ('Pi Day', '2026-03-14', 'holiday', 'Fun math/data-themed content opportunity', 'auto', ARRAY['data','fun','analytics']),
  ('St. Patrick''s Day', '2026-03-17', 'holiday', 'Light-hearted brand engagement opportunity', 'auto', ARRAY['culture','engagement']),
  ('World Water Day', '2026-03-22', 'holiday', 'ESG / sustainability angle for B2B content', 'auto', ARRAY['ESG','sustainability']),
  ('National Pencil Day', '2026-03-30', 'holiday', 'Quirky content: "still signing paper checks?" angle', 'auto', ARRAY['automation','digital transformation']),

  -- APRIL 2026
  ('National AP Automation Day', '2026-04-15', 'industry', 'Industry awareness day — perfect for AP automation product content', 'auto', ARRAY['AP','automation','portals']),
  ('Earth Day', '2026-04-22', 'holiday', 'Paperless / sustainability messaging for digital payments', 'auto', ARRAY['sustainability','paperless','ESG']),
  ('Administrative Professionals Day', '2026-04-22', 'holiday', 'Recognize AP/AR teams — tie into workflow automation', 'auto', ARRAY['AP','AR','appreciation']),
  ('National Small Business Week (starts)', '2026-04-26', 'industry', 'Content for SMB ICP — payment solutions for growing businesses', 'auto', ARRAY['SMB','small business','growth']),

  -- MAY 2026
  ('World Password Day', '2026-05-07', 'industry', 'Security-themed content for payment portals', 'auto', ARRAY['security','authentication','portals']),
  ('Credit Congress & Expo', '2026-05-11', 'conference', 'NACM flagship event for credit professionals', 'auto', ARRAY['credit','AR','collections']),
  ('National Accounting Day', '2026-05-17', 'holiday', 'Celebrate finance teams — automation content opportunity', 'auto', ARRAY['accounting','finance','AP']),
  ('Memorial Day', '2026-05-25', 'holiday', 'US holiday — schedule content around office closures', 'auto', ARRAY['holiday','US']),

  -- JUNE 2026
  ('Money20/20 Europe', '2026-06-02', 'conference', 'Leading fintech conference in Europe — major industry event', 'auto', ARRAY['fintech','payments','B2B','Europe']),
  ('World Environment Day', '2026-06-05', 'holiday', 'Paperless payments = greener planet content angle', 'auto', ARRAY['sustainability','paperless','ESG']),
  ('National Email Day', '2026-06-14', 'industry', 'Email automation for payment reminders content', 'auto', ARRAY['email','automation','AR']),
  ('Juneteenth', '2026-06-19', 'holiday', 'US holiday — celebrate diversity in fintech', 'auto', ARRAY['diversity','culture','US']),

  -- JULY 2026
  ('Independence Day', '2026-07-04', 'holiday', 'US holiday — patriotic/independence themed content', 'auto', ARRAY['holiday','US']),
  ('National Simplicity Day', '2026-07-12', 'holiday', 'Perfect for "simplify your payment workflows" messaging', 'auto', ARRAY['simplification','UX','portals']),
  ('National Get Out of Debt Day', '2026-07-18', 'industry', 'AR collections and cash flow content opportunity', 'auto', ARRAY['AR','collections','cash flow']),

  -- AUGUST 2026
  ('National Dollar Day', '2026-08-08', 'holiday', 'Fun payment/money-themed content', 'auto', ARRAY['payments','finance','fun']),
  ('National Financial Awareness Day', '2026-08-14', 'industry', 'Financial literacy content for B2B — payment best practices', 'auto', ARRAY['finance','education','B2B']),
  ('National Nonprofit Day', '2026-08-17', 'holiday', 'Nonprofit payment solutions content', 'auto', ARRAY['nonprofit','payments','social impact']),

  -- SEPTEMBER 2026
  ('Labor Day', '2026-09-07', 'holiday', 'US holiday — workforce automation angle', 'auto', ARRAY['holiday','US','workforce']),
  ('National Hispanic Heritage Month (starts)', '2026-09-15', 'holiday', 'Diversity and inclusion content opportunity', 'auto', ARRAY['diversity','culture','inclusion']),
  ('Sibos 2026', '2026-09-21', 'conference', 'SWIFT global financial messaging conference', 'auto', ARRAY['banking','payments','SWIFT','global']),
  ('National Punctuation Day', '2026-09-24', 'holiday', 'Playful content: "Don''t let misplaced decimals mess up your invoices"', 'auto', ARRAY['invoicing','accuracy','fun']),
  ('World Fintech Day', '2026-09-30', 'industry', 'Celebrate fintech innovation — thought leadership content', 'auto', ARRAY['fintech','innovation','thought leadership']),

  -- OCTOBER 2026
  ('National Cybersecurity Awareness Month (starts)', '2026-10-01', 'industry', 'Month-long security content campaign for payment portals', 'auto', ARRAY['security','cybersecurity','compliance']),
  ('World Investor Week (starts)', '2026-10-05', 'industry', 'Financial industry awareness — investor relations content', 'auto', ARRAY['finance','investors','growth']),
  ('National Manufacturing Day', '2026-10-02', 'industry', 'Manufacturing ICP content — payment solutions for manufacturers', 'auto', ARRAY['manufacturing','B2B','portals']),
  ('AFP Annual Conference', '2026-10-18', 'conference', 'Association for Financial Professionals annual event', 'auto', ARRAY['treasury','finance','AR','payments']),
  ('Halloween', '2026-10-31', 'holiday', 'Spooky content: "Don''t let late payments haunt your cash flow"', 'auto', ARRAY['fun','engagement','AR']),

  -- NOVEMBER 2026
  ('World Fintech Festival', '2026-11-02', 'conference', 'Global fintech community gathering in Singapore', 'auto', ARRAY['fintech','innovation','global']),
  ('National Stress Awareness Day', '2026-11-04', 'holiday', 'Reduce AP/AR stress with automation content', 'auto', ARRAY['automation','wellbeing','AP','AR']),
  ('National STEM Day', '2026-11-08', 'industry', 'Tech/innovation content — building the future of payments', 'auto', ARRAY['STEM','innovation','technology']),
  ('Veterans Day', '2026-11-11', 'holiday', 'US holiday — honor veterans, schedule content accordingly', 'auto', ARRAY['holiday','US']),
  ('Thanksgiving', '2026-11-26', 'holiday', 'Gratitude-themed content — thank your customers and partners', 'auto', ARRAY['gratitude','customer','holiday','US']),
  ('Black Friday / Cyber Monday', '2026-11-27', 'industry', 'Payment volume spikes — reliability/scalability content', 'auto', ARRAY['payments','scalability','ecommerce']),

  -- DECEMBER 2026
  ('Computer Science Education Week (starts)', '2026-12-07', 'industry', 'Tech innovation and education content', 'auto', ARRAY['education','technology','STEM']),
  ('Year-End Financial Planning', '2026-12-15', 'industry', 'Year-end close, reconciliation, and planning content', 'auto', ARRAY['finance','year-end','planning','AP','AR']),
  ('Christmas', '2026-12-25', 'holiday', 'Holiday greetings and year-in-review content', 'auto', ARRAY['holiday','year-end']),
  ('New Year''s Eve', '2026-12-31', 'holiday', '2027 predictions and fintech trends content', 'auto', ARRAY['predictions','trends','new year']);
