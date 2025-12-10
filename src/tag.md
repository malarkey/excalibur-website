---
layout: layouts/tag.html
pagination:
  data: collections.placeTagPages
  size: 1
  alias: tagPage
  addAllPagesToCollections: true
permalink: "{{ tagPage.permalink }}"
eleventyComputed:
  title: "{{ tagPage.title }}"
  tag: "{{ tagPage.tag }}"
---