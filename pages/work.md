---
layout: default
title: Work & Research
permalink: /work/
---
<div class="reading">
  <h1 class="page-title">Work &amp; Research</h1>

  <p>My current work includes an interactive mathematics essay on spectral geometry.</p>

  <hr>

  <h2 class="entry-title">Looking ahead</h2>
  <p>The <a href="{{ '/research-ideas/' | relative_url }}">Vibe research idea</a> page outlines
  three theoretical computer science proposals and five exploratory AI ideas. They describe questions
  I hope to investigate, rather than completed projects or published results.</p>

  <hr>

  <ul class="clean-list">
    {% assign items = site.data.work | sort: "date" | reverse %}
    {% for item in items %}
      <li>
        <span class="list-date">{{ item.date }}</span>
        <h2 class="entry-title">{% if item.url %}<a href="{{ item.url | relative_url }}">{{ item.title }}</a>{% else %}{{ item.title }}{% endif %}</h2>
        {% if item.note %}<p class="entry-note">{{ item.note }}</p>{% endif %}
      </li>
    {% endfor %}
  </ul>
</div>
