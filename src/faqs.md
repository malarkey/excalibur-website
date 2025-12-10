---
title: "Frequently asked questions"
layout: layouts/page.html
permalink: /faqs/

aside: |

  <h3><a href="/about">The film</a></h3>

  <p>The world loves Tolkien, Game of Thrones, and Harry Potter. Audiences are constantly searching for the next fantasy franchise. Well, here it stands—Arthur, the first and mightiest of them all.</p>

  <p>Cymru is the land on which Middle Earth—and our concept of Western European fantasy—is based. It has a rich, deep legendarium full of wildly interesting characters and concepts.</p>

---

{% for faq in collections.faqs %}
<details>
<summary>{{ faq.data.title }}</summary>
<div class="faq-answer">
{{ faq.templateContent | safe }}
</div>
</details>
{% endfor %}
