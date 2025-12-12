const { execSync } = require("child_process");
const rssPlugin = require("@11ty/eleventy-plugin-rss");
const Image = require("@11ty/eleventy-img");

// Filters
const dateFilter = require("./src/filters/date-filter.js");
const w3DateFilter = require("./src/filters/w3-date-filter.js");
const sortByDisplayOrder = require("./src/utils/sort-by-display-order.js");

// Async image shortcode
async function imageShortcode(src, alt, sizes = "(min-width: 1024px) 50vw, 100vw") {
let metadata = await Image(src, {
widths: [300, 600, 1200],
formats: ["webp", "jpeg"],
outputDir: "./dist/images/",
urlPath: "/images/"
});

let imageAttributes = {
alt,
sizes,
loading: "lazy",
decoding: "async"
};

return Image.generateHTML(metadata, imageAttributes);
}

// CSS inlining filter for Netlify CMS
function inlineFilter(path) {
const fs = require("fs");
const filepath = `dist${path}`;

if (fs.existsSync(filepath)) {
const buffer = fs.readFileSync(filepath);
return buffer.toString('utf8').replace(/^\uFEFF/, '');
}
return `/* CSS file ${path} not found */`;
}

module.exports = function(eleventyConfig) {
// Filters
eleventyConfig.addFilter("dateFilter", dateFilter);
eleventyConfig.addFilter("w3DateFilter", w3DateFilter);
eleventyConfig.addFilter("sortByDisplayOrder", sortByDisplayOrder);
eleventyConfig.addFilter("inline", inlineFilter);

// Add the limit filter back
eleventyConfig.addFilter("limit", function(collection, limit) {
return collection.slice(0, limit);
});

// BLOG FILTERS
eleventyConfig.addFilter("filterBlogByCategory", (posts, category) => {
return posts.filter(post =>
post.data.postCategories && post.data.postCategories.includes(category)
);
});

// BLOG TAG FILTER
eleventyConfig.addFilter("filterBlogByTag", (posts, tag) => {
return posts.filter(post =>
post.data.postTags && post.data.postTags.includes(tag)
);
});

// FAQ FILTERS
eleventyConfig.addFilter("filterFaqsByCategory", (faqs, category) => {
return faqs.filter(faq =>
faq.data.categories && faq.data.categories.includes(category)
);
});

eleventyConfig.addFilter("filterFaqsWithoutCategories", (faqs) => {
return faqs.filter(faq =>
!faq.data.categories || faq.data.categories.length === 0
);
});

// PLACES FILTERS
eleventyConfig.addFilter("filterPlacesByCategory", (places, category) => {
return places.filter(place =>
place.data.category && place.data.category === category
);
});

eleventyConfig.addFilter("filterPlacesByTag", (places, tag) => {
return places.filter(place =>
place.data.tags && place.data.tags.includes(tag)
);
});

eleventyConfig.addFilter("filterPlacesByTown", (places, town) => {
return places.filter(place =>
place.data.town && place.data.town === town
);
});

eleventyConfig.addFilter("filterPlacesByType", (places, type) => {
return places.filter(place =>
place.data.type && place.data.type === type
);
});

// STORIES FILTERS
eleventyConfig.addFilter("storiesByPlace", (stories, placeUrl) => {
return stories.filter(story =>
story.data.place && story.data.place === placeUrl
);
});

eleventyConfig.addFilter("storiesByCategory", function(stories, categoryName) {
  // Get collections from the Nunjucks context (this.ctx)
  const collections = this.ctx?.collections;
  if (!collections?.places) return [];

  return stories.filter(story => {
    if (!story.data.place) return false;

    // Find the place this story is about
    const place = collections.places.find(p => p.fileSlug === story.data.place);
    if (!place || !place.data.category) return false;

    return place.data.category === categoryName;
  });
});

eleventyConfig.addFilter("filterByAuthor", (stories, authorName) => {
return stories.filter(story =>
story.data.author && story.data.author === authorName
);
});

eleventyConfig.addFilter("findPlaceByUrl", (places, placeUrl) => {
return places.find(place => place.fileSlug === placeUrl);
});

// Filter places with coordinates for mapping
eleventyConfig.addFilter("placesWithCoordinates", (places) => {
return places.filter(place =>
place.data.coordinates && place.data.coordinates.trim() !== ""
);
});

// Parse coordinates string to object
eleventyConfig.addFilter("parseCoordinates", (coordString) => {
if (!coordString) return { lat: null, lng: null };
const [lat, lng] = coordString.split(',').map(coord => coord.trim());
return { lat: parseFloat(lat), lng: parseFloat(lng) };
});

// Plugins
eleventyConfig.addPlugin(rssPlugin);

// Shortcodes
eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

// Passthrough copy
eleventyConfig.addPassthroughCopy("src/fonts");
eleventyConfig.addPassthroughCopy("src/admin");
eleventyConfig.addPassthroughCopy("._redirects");
eleventyConfig.addPassthroughCopy("src/css");
eleventyConfig.addPassthroughCopy("src/js");
eleventyConfig.addPassthroughCopy("src/images");

// COLLECTIONS

// PHOTOS COLLECTION
eleventyConfig.addCollection("photos", (collection) => {
return collection.getFilteredByGlob("./src/photos/*.md").reverse();
});

// FAQ COLLECTION
eleventyConfig.addCollection("faqs", (collection) => {
return collection.getFilteredByGlob("./src/faqs/*.md").sort((a, b) => {
return a.data.title.localeCompare(b.data.title);
});
});

// FAQ CATEGORIES COLLECTION
eleventyConfig.addCollection("faqCategories", (collection) => {
let categories = new Set();
collection.getFilteredByGlob("./src/faqs/*.md").forEach(faq => {
if (faq.data.categories) {
faq.data.categories.forEach(cat => categories.add(cat));
}
});
return Array.from(categories).sort();
});

// GENERATE FAQ CATEGORY PAGES
eleventyConfig.addCollection("faqCategoryPages", function(collectionApi) {
const categories = new Set();
const faqs = collectionApi.getFilteredByGlob("./src/faqs/*.md");

faqs.forEach(faq => {
if (faq.data.categories) {
faq.data.categories.forEach(cat => categories.add(cat));
}
});

return Array.from(categories).map(category => {
return {
title: `FAQs: ${category}`,
category: category,
permalink: `/faqs/category/${category.toLowerCase().replace(/\s+/g, '-')}/`,
layout: "layouts/base.html"
};
});
});

// BLOG COLLECTION
eleventyConfig.addCollection("blog", (collection) => {
return [...collection.getFilteredByGlob("./src/posts/*.md")].reverse();
});

// BLOG TAXONOMY COLLECTIONS
eleventyConfig.addCollection("postCategories", (collection) => {
let categories = new Set();
collection.getFilteredByGlob("./src/posts/*.md").forEach(post => {
if (post.data.postCategories) {
post.data.postCategories.forEach(cat => categories.add(cat));
}
});
return Array.from(categories).sort();
});

eleventyConfig.addCollection("postTags", (collection) => {
let tags = new Set();
collection.getFilteredByGlob("./src/posts/*.md").forEach(post => {
if (post.data.postTags) {
post.data.postTags.forEach(tag => tags.add(tag));
}
});
return Array.from(tags).sort();
});

// GENERATE BLOG CATEGORY PAGES
eleventyConfig.addCollection("blogCategoryPages", function(collectionApi) {
const categories = new Set();
const posts = collectionApi.getFilteredByGlob("./src/posts/*.md");

posts.forEach(post => {
if (post.data.postCategories) {
post.data.postCategories.forEach(cat => categories.add(cat));
}
});

return Array.from(categories).map(category => {
return {
title: `${category}`,
category: category,
permalink: `/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}/`,
layout: "layouts/base.html"
};
});
});

// ADD BLOG TAG PAGES COLLECTION
eleventyConfig.addCollection("blogTagPages", function(collectionApi) {
const tags = new Set();
const posts = collectionApi.getFilteredByGlob("./src/posts/*.md");

posts.forEach(post => {
if (post.data.postTags) {
post.data.postTags.forEach(tag => tags.add(tag));
}
});

return Array.from(tags).map(tag => {
return {
title: `${tag}`,
tag: tag,
permalink: `/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}/`,
layout: "layouts/base.html"
};
});
});

// TEAM COLLECTION
eleventyConfig.addCollection("team", (collection) => {
return collection.getFilteredByGlob("./src/team/*.md");
});

// MYSTIC WALES PLACES COLLECTION
eleventyConfig.addCollection("places", (collection) => {
return [...collection.getFilteredByGlob("./src/places/*.md")].reverse();
});

// PLACES CATEGORIES COLLECTION
eleventyConfig.addCollection("placeCategories", (collection) => {
let categories = new Set();
collection.getFilteredByGlob("./src/places/*.md").forEach(place => {
if (place.data.category) {
categories.add(place.data.category);
}
});
return Array.from(categories).sort();
});

// PLACES TAGS COLLECTION
eleventyConfig.addCollection("placeTags", (collection) => {
let tags = new Set();
collection.getFilteredByGlob("./src/places/*.md").forEach(place => {
if (place.data.tags) {
place.data.tags.forEach(tag => tags.add(tag));
}
});
return Array.from(tags).sort();
});

// PLACES TOWNS COLLECTION
eleventyConfig.addCollection("placeTowns", (collection) => {
let towns = new Set();
collection.getFilteredByGlob("./src/places/*.md").forEach(place => {
if (place.data.town) {
towns.add(place.data.town);
}
});
return Array.from(towns).sort();
});

// PLACES TYPES COLLECTION
eleventyConfig.addCollection("placeTypes", (collection) => {
let types = new Set();
collection.getFilteredByGlob("./src/places/*.md").forEach(place => {
if (place.data.type) {
types.add(place.data.type);
}
});
return Array.from(types).sort();
});

// STORIES COLLECTION
eleventyConfig.addCollection("stories", (collection) => {
return [...collection.getFilteredByGlob("./src/stories/*.md")].reverse();
});

// STORIES AUTHORS COLLECTION
eleventyConfig.addCollection("storyAuthors", (collection) => {
let authors = new Set();
collection.getFilteredByGlob("./src/stories/*.md").forEach(story => {
if (story.data.author) {
authors.add(story.data.author);
}
});
return Array.from(authors).sort();
});

// STORIES TAGS COLLECTION
eleventyConfig.addCollection("storyTags", (collection) => {
let tags = new Set();
collection.getFilteredByGlob("./src/stories/*.md").forEach(story => {
if (story.data.tags) {
story.data.tags.forEach(tag => tags.add(tag));
}
});
return Array.from(tags).sort();
});

// STORIES PLACES COLLECTION (unique places with stories)
eleventyConfig.addCollection("storyPlaces", (collection) => {
let places = new Set();
collection.getFilteredByGlob("./src/stories/*.md").forEach(story => {
if (story.data.place) {
places.add(story.data.place);
}
});
return Array.from(places).sort();
});

// NEW: STORIES BY CATEGORY COLLECTION
eleventyConfig.addCollection("storiesByCategoryCollection", function(collectionApi) {
const stories = collectionApi.getFilteredByGlob("./src/stories/*.md");
const places = collectionApi.getFilteredByGlob("./src/places/*.md");

const result = {};

stories.forEach(story => {
if (story.data.place) {
const place = places.find(p => p.fileSlug === story.data.place);
if (place && place.data.category) {
const category = place.data.category;
if (!result[category]) {
result[category] = [];
}
result[category].push(story);
}
}
});

return result;
});

// GENERATE PLACES CATEGORY PAGES
eleventyConfig.addCollection("placeCategoryPages", function(collectionApi) {
const categories = new Set();
const places = collectionApi.getFilteredByGlob("./src/places/*.md");

places.forEach(place => {
if (place.data.category) {
categories.add(place.data.category);
}
});

return Array.from(categories).map(category => {
return {
title: `${category}`,
category: category,
permalink: `/places/category/${category.toLowerCase().replace(/\s+/g, '-')}/`
};
});
});

// GENERATE PLACES TAG PAGES
eleventyConfig.addCollection("placeTagPages", function(collectionApi) {
const tags = new Set();
const places = collectionApi.getFilteredByGlob("./src/places/*.md");

places.forEach(place => {
if (place.data.tags) {
place.data.tags.forEach(tag => tags.add(tag));
}
});

return Array.from(tags).map(tag => {
return {
title: `${tag}`,
tag: tag,
permalink: `/places/tag/${tag.toLowerCase().replace(/\s+/g, '-')}/`
};
});
});

// GENERATE PLACES TOWN PAGES
eleventyConfig.addCollection("placeTownPages", function(collectionApi) {
const towns = new Set();
const places = collectionApi.getFilteredByGlob("./src/places/*.md");

places.forEach(place => {
if (place.data.town) {
towns.add(place.data.town);
}
});

return Array.from(towns).map(town => {
return {
title: `${town}`,
town: town,
permalink: `/places/town/${town.toLowerCase().replace(/\s+/g, '-')}/`
};
});
});

// GENERATE PLACES TYPE PAGES
eleventyConfig.addCollection("placeTypePages", function(collectionApi) {
const types = new Set();
const places = collectionApi.getFilteredByGlob("./src/places/*.md");

places.forEach(place => {
if (place.data.type) {
types.add(place.data.type);
}
});

return Array.from(types).map(type => {
return {
title: `${type}`,
type: type,
permalink: `/places/type/${type.toLowerCase().replace(/\s+/g, '-')}/`
};
});
});

// GENERATE STORIES AUTHOR PAGES
eleventyConfig.addCollection("storyAuthorPages", function(collectionApi) {
const authors = new Set();
const stories = collectionApi.getFilteredByGlob("./src/stories/*.md");

stories.forEach(story => {
if (story.data.author) {
authors.add(story.data.author);
}
});

return Array.from(authors).map(author => {
return {
title: `Stories by ${author}`,
author: author,
permalink: `/stories/author/${author.toLowerCase().replace(/\s+/g, '-')}/`
};
});
});

// GENERATE STORIES TAG PAGES
eleventyConfig.addCollection("storyTagPages", function(collectionApi) {
const tags = new Set();
const stories = collectionApi.getFilteredByGlob("./src/stories/*.md");

stories.forEach(story => {
if (story.data.tags) {
story.data.tags.forEach(tag => tags.add(tag));
}
});

return Array.from(tags).map(tag => {
return {
title: `Stories: ${tag}`,
tag: tag,
permalink: `/stories/tag/${tag.toLowerCase().replace(/\s+/g, '-')}/`
};
});
});

// Use .eleventyignore, not .gitignore
eleventyConfig.setUseGitIgnore(false);

// Directory structure
return {
markdownTemplateEngine: "njk",
dataTemplateEngine: "njk",
htmlTemplateEngine: "njk",
dir: {
input: "src",
output: "dist"
}
};
};