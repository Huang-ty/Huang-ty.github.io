---
layout: default
title: Publications
permalink: /publications/
---
<div class="reading">
  <h1 class="page-title">Publications</h1>

  <p>Selected papers. Most recent first.</p>

  <hr>

  <ul class="clean-list">
    {% assign pubs = site.data.publications | sort: "date" | reverse %}
    {% for p in pubs %}
      <li>
        <span class="list-date">{{ p.date }}</span>
        <h2 class="entry-title">{% if p.url %}<a href="{{ p.url }}">{{ p.title }}</a>{% else %}{{ p.title }}{% endif %}</h2>
        {% if p.authors %}<p class="entry-venue">{{ p.authors }}</p>{% endif %}
        {% if p.venue %}<p class="entry-note">{{ p.venue }}{% if p.note %} · {{ p.note }}{% endif %}</p>{% endif %}
        {% if p.links %}
          <p class="entry-note">
            {% for link in p.links %}
              [<a href="{{ link.url }}">{{ link.title }}</a>]
            {% endfor %}
          </p>
        {% endif %}
      </li>
    {% endfor %}
  </ul>
</div>
