---
layout: layouts/category.html
pagination:
  data: collections.placeCategoryPages
  size: 1
  alias: categoryPage
  addAllPagesToCollections: true
permalink: "{{ categoryPage.permalink }}"
eleventyComputed:
  title: "{{ categoryPage.title }}"
  category: "{{ categoryPage.category }}"
---