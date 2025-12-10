---
featureImage:
featureImageCaption:
layout: 'layouts/feed.html'
metaDesc:
pagination:
  data: collections.blog
  size: 10
paginationPrevText: 'Newer'
paginationNextText: 'Older'
paginationAnchor: '#post-list'
permalink: 'blog{% if pagination.pageNumber > 0 %}/page/{{ pagination.pageNumber }}{% endif %}/index.html'
title: 'News'

---
