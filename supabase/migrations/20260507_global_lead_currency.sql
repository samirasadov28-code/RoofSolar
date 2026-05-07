-- Add multi-currency support to the leads table.
--
-- Old `budget_gbp` was written but never populated by the lead form (it's
-- inferred from the calculation, not collected). We keep the column for
-- legacy rows and add explicit `currency_code` so non-UK leads aren't
-- mislabelled as GBP downstream.

alter table if exists leads
  add column if not exists currency_code text,
  add column if not exists country_code  text;

-- Optional: backfill currency_code from the calculation it links to.
-- Safe no-op if calculations.inputs->>'countryCode' is null.
update leads l
set    currency_code = case
         when c.inputs->>'countryCode' = 'ie' then 'EUR'
         when c.inputs->>'countryCode' = 'gb' then 'GBP'
         when c.inputs->>'countryCode' is not null then upper(c.inputs->>'countryCode')
         else null
       end,
       country_code = c.inputs->>'countryCode'
from   calculations c
where  l.calculation_id = c.id
  and  l.currency_code is null;
