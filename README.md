# focaaby.com

Hugo static site, migrated from Ghost 5.80 (Nov 2026). The theme in `layouts/` is a port of the original Casper-based Ghost theme (`casper-focaaby`), so URLs and look are unchanged.

## Architecture

```
git push main -> GitHub Actions (hugo build) -> S3 REDACTED-BUCKET (ap-northeast-1, website hosting)
                                             -> CloudFront REDACTED-DISTRIBUTION-ID invalidation /*
viewer -> CloudFront (focaaby.com, www.focaaby.com) -> CloudFront Function -> S3 website endpoint
```

- AWS auth: GitHub OIDC -> IAM role `focaaby-blog-github-deploy` (main branch only)
- Legacy Ghost URL handling: `infra/cloudfront-viewer-request.js` (CloudFront Function `focaaby-blog-viewer-request`)
  - `www` -> apex, `/<slug>/amp/` -> `/<slug>/`, `/sitemap-*.xml` -> `/sitemap.xml`, `/page/1/` -> parent,
    `/rss/` -> `/index.xml` (rewrite), missing trailing slash -> add slash. All 301.
- GA4 `G-X4XH8Z193H`, AdSense and utterances comments are configured in `hugo.toml` `[params]`.

## Writing

Old posts are raw Ghost HTML (`content/posts/*.html`). New posts can be Markdown:

```bash
hugo new content posts/my-new-post.md   # then set title, slug, tags, excerpt
hugo server                              # preview at http://localhost:1313
```

Front matter used by the theme: `title`, `slug`, `date`, `tags` (first = primary tag), `authors: ["focaaby"]`,
`excerpt` (card text), `description`, `custom_excerpt`, `feature_image`, `feature_image_caption`.
