#!/usr/bin/env python3
"""
Blog static-site generator for Everest.

Builds the blog from markdown files in blog/, in the Everest design. The archive
IS the Resources page (/resources/); individual posts live at /resources/<slug>/.
The rest of the site is hand-built static HTML and is left untouched; this script
only writes under resources/.

Future-dated posts (NZ time) and drafts are excluded from all output, which is
the scheduling mechanism: a post dated in the future sits dormant until a rebuild
picks it up on its date.

Run at build time (vercel.json buildCommand) BEFORE tools/generate.js, which then
regenerates sitemap.xml + llms.txt and picks up the generated post pages.
"""
import os, re, json, html, datetime
from pathlib import Path

import yaml
import markdown as md
from jinja2 import Environment, FileSystemLoader, select_autoescape

try:
    from zoneinfo import ZoneInfo
    NZ = ZoneInfo("Pacific/Auckland")
except Exception:  # pragma: no cover
    NZ = datetime.timezone(datetime.timedelta(hours=12))

ROOT = Path(__file__).parent.parent.resolve()
SITE = os.environ.get("SITE_URL", "https://everest-personal-training.vercel.app").rstrip("/")
BRAND = "Everest"
DEFAULT_OG = SITE + "/assets/img/og-default.jpg"
POSTS_PER_PAGE = 1000  # effectively no pagination

env = Environment(
    loader=FileSystemLoader(str(ROOT)),
    autoescape=select_autoescape(["html", "xml"]),
    trim_blocks=False, lstrip_blocks=False,
)


def slugify(value):
    value = re.sub(r"[^\w\s-]", "", str(value).lower()).strip()
    return re.sub(r"[\s_]+", "-", value)


env.filters["slugify"] = slugify
TODAY = datetime.datetime.now(NZ).date()


# ---------------------------------------------------------------- posts
def parse_post(path):
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", raw, re.S)
    if not m:
        raise ValueError(f"{path.name}: missing YAML frontmatter")
    meta = yaml.safe_load(m.group(1)) or {}
    body_md = m.group(2)

    for req in ("title", "date", "slug", "excerpt"):
        if not meta.get(req):
            raise ValueError(f"{path.name}: missing required field '{req}'")

    # smart_dashes OFF so no en/em dashes are ever generated (public copy stays dash-free)
    body_html = md.markdown(body_md, extensions=["extra", "sane_lists", "smarty", "toc"],
                            extension_configs={"smarty": {"smart_dashes": False}})
    words = len(re.findall(r"\w+", re.sub(r"<[^>]+>", " ", body_html)))
    date = datetime.date.fromisoformat(str(meta["date"]))

    faq = []
    for item in (meta.get("faq") or []):
        q = (item.get("q") or item.get("question") or "").strip()
        a = (item.get("a") or item.get("answer") or "").strip()
        if q and a:
            faq.append({"q": q, "a": a})

    slug = slugify(meta["slug"])
    return {
        "title": meta["title"],
        "date": date.isoformat(),
        "date_obj": date,
        "date_display": date.strftime("%-d %B %Y"),
        "slug": slug,
        "excerpt": meta["excerpt"],
        "summary": (meta.get("summary") or "").strip(),
        "featured_image": (meta.get("featured_image") or "").strip(),
        "author": meta.get("author") or "Everest",
        "tags": meta.get("tags") or [],
        "faq": faq,
        "draft": bool(meta.get("draft", False)),
        "published": meta.get("published", None),
        "read_time": max(1, round(words / 200)),
        "body_html": body_html,
        "url": f"/resources/{slug}/",
        "og_image": (meta.get("featured_image") or "").strip() or DEFAULT_OG,
    }


def is_live(post):
    if post["draft"]:
        return False
    if post["published"] is False:
        return False
    if post["published"] is True:
        return True
    return post["date_obj"] <= TODAY  # future-dated posts stay dormant


def load_posts():
    posts = []
    blog_dir = ROOT / "blog"
    if blog_dir.exists():
        for p in sorted(blog_dir.glob("*.md")):
            if p.name.lower() == "readme.md":
                continue
            posts.append(parse_post(p))
    live = [p for p in posts if is_live(p)]
    live.sort(key=lambda p: p["date"], reverse=True)
    return live


def write(rel_path, content):
    out = ROOT / rel_path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(content, encoding="utf-8")
    return out


def og_abs(path):
    return path if path.startswith("http") else SITE + path


# ---------------------------------------------------------------- schema
def post_jsonld(post):
    blogposting = {
        "@type": "BlogPosting",
        "headline": post["title"],
        "description": post["excerpt"],
        "datePublished": post["date"],
        "dateModified": post["date"],
        "author": {"@type": "Person", "name": post["author"]},
        "publisher": {"@id": SITE + "/#business"},
        "image": og_abs(post["og_image"]),
        "mainEntityOfPage": {"@type": "WebPage", "@id": SITE + post["url"]},
        "url": SITE + post["url"],
        "isPartOf": {"@id": SITE + "/#website"},
        "inLanguage": "en-NZ",
    }
    graph = [
        blogposting,
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Resources", "item": SITE + "/resources/"},
            {"@type": "ListItem", "position": 3, "name": post["title"], "item": SITE + post["url"]},
        ]},
    ]
    if post["faq"]:
        graph.append({
            "@type": "FAQPage",
            "mainEntity": [
                {"@type": "Question", "name": f["q"],
                 "acceptedAnswer": {"@type": "Answer", "text": f["a"]}}
                for f in post["faq"]
            ],
        })
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)


# ---------------------------------------------------------------- build
def build_posts(posts):
    tmpl = env.get_template("templates/blog_post.html")
    for i, post in enumerate(posts):
        related = [p for p in posts if p["slug"] != post["slug"]][:3]
        write(f"resources/{post['slug']}/index.html", tmpl.render(
            post=post, related=related,
            page_title=f"{post['title']} | {BRAND}",
            page_description=post["excerpt"],
            canonical=SITE + post["url"],
            og_title=post["title"], og_image=og_abs(post["og_image"]),
            jsonld=post_jsonld(post),
        ))


def build_archive(posts):
    tmpl = env.get_template("templates/blog_archive.html")
    write("resources/index.html", tmpl.render(
        posts=posts,
        page_title="Resources & Insights | Everest Personal Training Christchurch",
        page_description="Evidence-led articles and insights on training, strength, fitness and human performance from Everest's Christchurch coaching team.",
        canonical=SITE + "/resources/", og_image=DEFAULT_OG,
        heading="Practical, evidence-led insights.",
        heading_lead="Articles answering the real questions we hear from the people and organisations we work with across Christchurch and Canterbury.",
        active_tag=None,
    ))


def build_tags(posts):
    tmpl = env.get_template("templates/blog_archive.html")
    tags = {}
    for post in posts:
        for t in post["tags"]:
            tags.setdefault(t, []).append(post)
    for tag, tag_posts in tags.items():
        s = slugify(tag)
        write(f"resources/tag/{s}/index.html", tmpl.render(
            posts=tag_posts, active_tag=tag,
            page_title=f"{tag} | Resources | {BRAND}",
            page_description=f"Everest articles and insights tagged {tag}.",
            canonical=SITE + f"/resources/tag/{s}/", og_image=DEFAULT_OG,
            heading=f"Tagged: {tag}.",
            heading_lead=f"Every Everest article tagged {tag}.",
            noindex=True,
        ))


def build_rss(posts):
    nl = "\n"; items = []
    for post in posts[:30]:
        pub = datetime.datetime.combine(post["date_obj"], datetime.time(8, 0), NZ)
        cats = "".join(f"      <category>{html.escape(t)}</category>{nl}" for t in post["tags"])
        items.append(f"""    <item>
      <title>{html.escape(post['title'])}</title>
      <link>{SITE}{post['url']}</link>
      <guid isPermaLink="true">{SITE}{post['url']}</guid>
      <pubDate>{pub.strftime('%a, %d %b %Y %H:%M:%S %z')}</pubDate>
      <description>{html.escape(post['excerpt'])}</description>
{cats}    </item>""")
    now = datetime.datetime.now(NZ).strftime('%a, %d %b %Y %H:%M:%S %z')
    write("resources/rss.xml", f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Everest Personal Training Blog</title>
    <link>{SITE}/resources/</link>
    <atom:link href="{SITE}/resources/rss.xml" rel="self" type="application/rss+xml" />
    <description>Evidence-led training, strength, fitness and human performance insights from Everest, Christchurch.</description>
    <language>en-nz</language>
    <lastBuildDate>{now}</lastBuildDate>
{chr(10).join(items)}
  </channel>
</rss>
""")


def main():
    posts = load_posts()
    print(f"Blog: building {len(posts)} live post(s) (today={TODAY} NZ)")
    build_posts(posts)
    build_archive(posts)
    build_tags(posts)
    build_rss(posts)
    print("Blog build complete.")


if __name__ == "__main__":
    main()
