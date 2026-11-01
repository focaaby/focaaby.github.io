# focaaby.com

Hugo static site, migrated from Ghost 5.80 (Nov 2026). The theme in `layouts/` is a port of the original Casper-based Ghost theme (`casper-focaaby`), so URLs and look are unchanged.

## Architecture

```
git push main -> GitHub Actions (hugo build) -> S3 bucket (website hosting)
                                             -> CloudFront invalidation /*
viewer -> CloudFront (focaaby.com, www.focaaby.com) -> CloudFront Function -> S3 website endpoint
```

- AWS auth: GitHub OIDC -> IAM role `focaaby-blog-github-deploy` (main branch only)
- Legacy Ghost URL handling: `infra/cloudfront-viewer-request.js` (CloudFront Function `focaaby-blog-viewer-request`)
  - `www` -> apex, `/<slug>/amp/` -> `/<slug>/`, `/sitemap-*.xml` -> `/sitemap.xml`, `/page/1/` -> parent,
    `/rss/` -> `/index.xml` (rewrite), missing trailing slash -> add slash. All 301.
- `focaaby.github.io` (GitHub Pages) only serves the redirect pages in `pages-redirect/`, deployed by `.github/workflows/pages-redirect.yml`.
- GA4 `G-X4XH8Z193H`, AdSense and utterances comments are configured in `hugo.toml` `[params]`.

## Writing

Old posts are raw Ghost HTML (`content/posts/*.html`). New posts can be Markdown:

```bash
hugo new content posts/my-new-post.md   # then set title, slug, tags, excerpt
hugo server                              # preview at http://localhost:1313
```

Front matter used by the theme: `title`, `slug`, `date`, `tags` (first = primary tag), `authors: ["focaaby"]`,
`excerpt` (card text), `description`, `custom_excerpt`, `feature_image`, `feature_image_caption`.

## Resume

- `/resume/` is `content/resume.html` (hand-converted from https://github.com/focaaby/resume `resume.tex`, phone number omitted).
- `/resume.pdf` is **not in git**. Build it in the resume repo and upload it manually; `deploy.yml` excludes it from `s3 sync --delete`.

```bash
# export S3_BUCKET=... CLOUDFRONT_DISTRIBUTION_ID=...   (values in private notes)
cd ~/Project/resume && ./latexdockercmd.sh            # -> resume.pdf
aws s3 cp resume.pdf "s3://$S3_BUCKET/resume.pdf" --profile focaaby \
  --content-type application/pdf --cache-control 'max-age=3600' \
  --content-disposition 'attachment; filename="Mao-Lin_Wang_Resume.pdf"'
aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths /resume.pdf --profile focaaby
```
