# Personal website — Huang-ty

A minimal personal site built with plain Jekyll (no theme, no build tools). Ink-on-paper aesthetic:
serif body for reading, a single sans-serif for nav and metadata, hairlines for separation, one muted
accent colour. No cards, shadows, rounded corners or gradients.

## Structure

```
_config.yml          site settings (title, url, contact links) — edit the social/email bits
Gemfile              jekyll + feed + seo gems
index.html           Home (link-dense intro paragraphs)
assets/
  css/style.css       all styling (design tokens in :root)
  js/filter.js        front-end category/tag filter for Life & Notes
_data/
  work.yml            entries for Work & Research (each: date, title, note)
  publications.yml    entries for Publications (date, title, authors, venue, note, links)
pages/
  about.md            About
  work.md             Work & Research (renders _data/work.yml)
  publications.md     Publications  (renders _data/publications.yml)
  life-and-notes.md   blog stream (renders site.posts + filter bar)
  contact.md          Contact
_posts/               markdown blog posts, one file per post (see naming below)
_layouts/
  default.html        base HTML + top nav + footer
  blog.html           blog-stream wrapper (adds the filter bar)
  post.html           single-article wrapper (narrow reading column)
_posts/               drop .md files here
```

## Adding content

### A blog post (goes to Life & Notes)

Create a file in `_posts/` named `YYYY-MM-DD-slug.md`:

```
---
layout: post
title: 你的标题
date: 2026-01-31 09:00:00 +0800
categories: [科研笔记]        # one of: 科研笔记 / 随笔 / 生活  (keep as a single word, no spaces)
tags: [一个标签]
---

首段会成为列表页的摘要。
```

- `categories` and `tags` must be single words with **no spaces** (they're space-separated in the data
  attributes for the filter). Filter buttons are generated automatically from existing posts.
- Post URLs are clean (/title/), independent of category.

### A Work / Publications entry

Edit `_data/work.yml` or `_data/publications.yml` and add an entry at the **top** (most recent first).
No HTML needed.

## Build locally

```bash
bundle install   # once
bundle exec jekyll serve
# then open http://localhost:4000
```

## Deploy to GitHub Pages

1. Create a repository named `Huang-ty.github.io` on GitHub.
2. Push this folder's contents to it:

```bash
git init
git add .
git commit -m "init personal site"
git branch -M main
git remote add origin https://github.com/Huang-ty.github.io.git
git push -u origin main
```

3. GitHub Pages will build automatically. Your site is live at
   `https://huang-ty.github.io`. Remember to set `url` and `baseurl` in `_config.yml` accordingly.
