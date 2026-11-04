# Jennifer Show — GitHub Pages upload build

This is a flattened static-site build for GitHub's web file uploader. Upload every file in this directory to the repository root, then enable GitHub Pages for the root of the selected branch.

Nested asset paths are flattened with `__` in place of `/`. HTML, CSS, JavaScript, portfolio data and dynamic asset prefixes have been rewritten to match. `sanfu.html` and `html2canvas.min.js` remain root-level files. Do not rename the generated files individually.

Original PDF, full video and archive files are excluded. The site uses WebP project pages and external video links. HTML contains `noindex,nofollow`; robots.txt disallows crawlers. These reduce indexing and do not restrict access to people who have the URL.
