---
layout: layouts/town.html
pagination:
  data: collections.placeTownPages
  size: 1
  alias: townPage
  addAllPagesToCollections: true
permalink: "{{ townPage.permalink }}"
eleventyComputed:
  title: "{{ townPage.title }}"
  town: "{{ townPage.town }}"
---