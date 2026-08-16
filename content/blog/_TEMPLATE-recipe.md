---
# TEMPLATE. Filename starts with an underscore and draft is true, so this
# never builds. Copy it, rename it, set draft to false.
#
# Required: title, date, slug, excerpt. Everything else is optional.
title: "High-Protein Overnight Oats"
date: "2026-09-01"
slug: "high-protein-overnight-oats"
excerpt: "A five-minute breakfast with around 30g of protein, made the night before, for people who do not have time to cook in the morning."
featured_image: ""
author: "Everest"
tags: ["Recipes", "Nutrition"]
draft: true

# `summary` is the answer-engine field. Write the complete answer to the
# question the post title asks, in two or three sentences that make sense
# with no other context. This is what an assistant quotes.
summary: "Overnight oats made with Greek yoghurt and protein powder deliver around 30g of protein per serve for roughly five minutes of work the night before. Combine oats, milk, yoghurt and protein powder, refrigerate overnight, and add fruit or nut butter in the morning."

# The recipe block emits Recipe schema on top of the usual BlogPosting.
# Both `ingredients` and `method` must be present or the block is skipped
# entirely — a partial Recipe is worse than none, because search engines
# treat malformed structured data as a quality signal against the whole site.
recipe:
  name: "High-Protein Overnight Oats"
  description: "A make-ahead breakfast with around 30g of protein per serve."
  yield: "1 serve"
  category: "Breakfast"
  cuisine: "New Zealand"
  # ISO 8601 durations. PT15M = 15 minutes, PT1H30M = 1 hour 30 minutes.
  prep_time: "PT5M"
  total_time: "PT8H5M"
  ingredients:
    - "1/2 cup rolled oats"
    - "1/2 cup milk of your choice"
    - "1/2 cup Greek yoghurt"
    - "1 scoop vanilla protein powder"
    - "1 tbsp chia seeds"
    - "Fruit or nut butter to serve"
  method:
    - "Combine the oats, milk, yoghurt, protein powder and chia seeds in a jar and stir until there are no dry pockets."
    - "Seal and refrigerate overnight, or for at least four hours."
    - "In the morning, stir, loosen with a splash of milk if needed, and top with fruit or nut butter."
  # Only state nutrition figures you have actually calculated. An estimate
  # published as fact is the same problem as an unverified impact statistic.
  nutrition:
    calories: "420 calories"
    protein: "32 g"
    carbs: "45 g"
    fat: "12 g"

# FAQ entries become FAQPage schema. Ask the question someone would type,
# and answer it so the answer stands alone.
faq:
  - q: "How much protein should breakfast have?"
    a: "Aim for 25 to 40 grams at breakfast if you are training regularly. Spreading protein evenly across meals supports muscle repair better than saving most of it for dinner."
  - q: "How long do overnight oats keep in the fridge?"
    a: "Up to three days in a sealed container, which makes them worth batching. Add fruit on the day you eat them rather than at the start."
---

Write the post body here in markdown. Open by answering the question in the
title immediately — do not save the answer for the end. Assistants and readers
who bounce both take what is in the first paragraph.

## Why this works

Use question-shaped headings. They match how people search and how assistants
segment a page for quoting.

## Notes

Everest is a coaching business, not a clinical one. Keep nutrition writing to
general guidance, avoid anything that reads as treating a condition, and do
not name a health claim you cannot support.
