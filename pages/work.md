---
layout: default
title: Work & Research
permalink: /work/
---
<div class="reading">
  <h1 class="page-title">Work &amp; Research</h1>

  <p>I work on machine learning methods for scientific data, with a warm spot for the plain and the
  reproducible. Below are the things I'm currently doing. Most recent first.</p>

  <hr>

  <ul class="clean-list">
    {% assign items = site.data.work | sort: "date" | reverse %}
    {% for item in items %}
      <li>
        <span class="list-date">{{ item.date }}</span>
        <h2 class="entry-title">{{ item.title }}</h2>
        {% if item.note %}<p class="entry-note">{{ item.note }}</p>{% endif %}
      </li>
    {% endfor %}
  </ul>
</div>
