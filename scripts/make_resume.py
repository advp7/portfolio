"""
Builds public/CV_ADVAITH.pdf, the one-page resume linked from the site.

    pip install reportlab
    python3 scripts/make_resume.py

Edit the content below, re-run, then deploy the site (`npm run deploy`).
"""

from pathlib import Path

from reportlab.lib.enums import TA_CENTER
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = Path(__file__).resolve().parent.parent / "public" / "CV_ADVAITH.pdf"

TEAL = HexColor("#0E7490")
INK = HexColor("#111827")
GREY = HexColor("#4B5563")
RULE = HexColor("#D1D5DB")

MARGIN_X = 50
WIDTH = A4[0] - 2 * MARGIN_X

# ------------------------------------------------------------------ styles

name = ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=21, leading=25,
                      alignment=TA_CENTER, textColor=INK)
headline = ParagraphStyle("headline", fontName="Helvetica", fontSize=11, leading=15,
                          alignment=TA_CENTER, textColor=TEAL)
contact = ParagraphStyle("contact", fontName="Helvetica", fontSize=8.6, leading=12.4,
                         alignment=TA_CENTER, textColor=GREY)
section = ParagraphStyle("section", fontName="Helvetica-Bold", fontSize=10, leading=12,
                         textColor=TEAL, spaceBefore=11, spaceAfter=3)
body = ParagraphStyle("body", fontName="Helvetica", fontSize=9.2, leading=12.4,
                      textColor=INK)
company = ParagraphStyle("company", fontName="Helvetica-Bold", fontSize=10.2,
                         leading=13, textColor=INK)
date = ParagraphStyle("date", fontName="Helvetica", fontSize=8.8, leading=13,
                      textColor=GREY, alignment=2)
role = ParagraphStyle("role", fontName="Helvetica-Oblique", fontSize=9.4,
                      leading=12.4, textColor=GREY, spaceAfter=2)

link = lambda url, text: f'<a href="{url}" color="#0E7490">{text}</a>'
SEP = "  ·  "

# ----------------------------------------------------------------- helpers


def heading(title):
    return [
        Paragraph(title.upper(), section),
        HRFlowable(width="100%", thickness=0.7, color=RULE, spaceBefore=0, spaceAfter=5),
    ]


def left_right(left, right, left_style=company, right_style=date):
    table = Table(
        [[Paragraph(left, left_style), Paragraph(right, right_style)]],
        colWidths=[WIDTH * 0.72, WIDTH * 0.28],
    )
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    return table


def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(text, body), leftIndent=12, value="•") for text in items],
        bulletType="bullet",
        start="•",
        bulletFontName="Helvetica",
        bulletFontSize=10,
        bulletColor=INK,
        leftIndent=12,
        bulletOffsetY=0,
        spaceBefore=0,
    )


def job(name_, dates, roles, points):
    return KeepTogether([
        left_right(name_, dates),
        Paragraph(roles, role),
        bullets(points),
        Spacer(1, 6),
    ])


# ----------------------------------------------------------------- content

story = [
    Paragraph("ADVAITH PRAVEEN", name),
    Paragraph("Senior Frontend Engineer · Full-Stack &amp; AI", headline),
    Spacer(1, 2),
    Paragraph(
        "Bengaluru, India" + SEP
        + link("mailto:advaith1601@gmail.com", "advaith1601@gmail.com") + SEP
        + "+91 98867 10260",
        contact,
    ),
    Paragraph(
        link("https://advp7.github.io/portfolio", "advp7.github.io/portfolio") + SEP
        + link("https://www.linkedin.com/in/advaith-praveen", "linkedin.com/in/advaith-praveen") + SEP
        + link("https://github.com/advp7", "github.com/advp7"),
        contact,
    ),
    Spacer(1, 2),
]

story += heading("Summary")
story.append(Paragraph(
    "Frontend engineer with <b>4+ years</b> shipping production web and mobile products in "
    "<b>React, React Native and TypeScript</b>, now building <b>AI-powered customer-experience "
    "products</b> on a conversational-AI platform. Works across the stack — shipping backend "
    "services in <b>Java (Spring Boot)</b> and <b>Python (FastAPI)</b> alongside the frontend. "
    "Promoted to Senior in <b>10 months</b> and selected for Engati's bar-raisers program.",
    body,
))

story += heading("Skills")
for label, items in [
    ("Frontend", "React, TypeScript, JavaScript, Redux Toolkit, HTML/CSS, Tailwind CSS, Material UI, Framer Motion"),
    ("AI Engineering", "AI agents, Gemini, LLM tool calling, prompt engineering, CX automation"),
    ("AI-Assisted Dev", "Claude Code, Codex, AI pair programming"),
    ("Mobile", "React Native, Android Studio, Xcode"),
    ("Backend &amp; Cloud", "Java (Spring Boot), Python (FastAPI), Redis, AWS, SQL, MongoDB"),
    ("Design &amp; Tools", "Git, Figma, Photoshop, responsive design"),
]:
    story.append(Paragraph(f"<b>{label}:</b> {items}", body))

story += heading("Experience")
story.append(job(
    "Engati Technologies — Bengaluru",
    "Mar 2024 – Present",
    "Senior UI Developer (Jan 2025 – Present) · UI Developer (Mar 2024 – Jan 2025)",
    [
        "Pulled in at short notice to land Engati's <b>RCS channel</b> — a Google-facing launch on a hard "
        "external deadline that opened a new revenue stream — and <b>shipped a working frontend in ~10 days</b>; "
        "went on to own its architecture and reusable component structure across broadcast, template-message "
        "and template-creation flows.",
        "Built <b>Ellie</b>, a custom AI assistant live on Edelweiss's site handling <b>hundreds of customer "
        "queries a week</b> — owned the frontend end to end and built into its <b>Python FastAPI</b> backend "
        "(Gemini calls, tool calling, Redis caching).",
        "Unblocked go-live for <b>Edelweiss</b>, a high-value enterprise account, engineering previously "
        "unattempted UI customizations in custom JavaScript/CSS as technical point of contact for "
        "implementation and CSM teams.",
        "<b>Promoted to Senior in 10 months</b>; selected for Engati's <b>bar-raisers program</b> and the go-to "
        "engineer for frontend architecture and code reviews on a small, high-ownership team.",
        "Expanded into full-stack delivery with backend work in <b>Java (Spring Boot)</b> and "
        "<b>Python (FastAPI)</b>, aligning API contracts and shaping end-to-end architecture decisions.",
    ],
))
story.append(job(
    "InfinityBox — Bengaluru",
    "Aug 2022 – Jan 2024",
    "Software Engineer, Frontend",
    [
        "Owned the frontend of InfinityBox's platform — including the operations dashboard and customer flows "
        "<b>teams at Swiggy and Zomato</b> used during partner collaborations — working directly with the CTO "
        "and founders.",
        "Delivered across web (<b>React</b>) and mobile (<b>React Native</b>), from Figma handoff to production "
        "deploys on <b>AWS</b>.",
        "Translated intricate UI designs into responsive interfaces across multiple external client projects "
        "under strict timelines.",
    ],
))
story.append(job(
    "Privafy Technologies — Bengaluru",
    "Sep 2021 – Mar 2022",
    "Software Engineer Intern",
    [
        "Built a feature-rich e-commerce frontend with <b>React</b>, Context API and REST API integration.",
        "Developed a faceted-search dashboard table with custom filter chips and specialised display logic.",
    ],
))

story += heading("Awards &amp; Recognition")
story.append(bullets([
    "<b>Ownership award, Engati</b> — for driving the RCS channel launch to go-live.",
    "<b>Two monthly company awards, Engati</b> — for Ellie, and for moving a Google Sheets integration to Drive Picker.",
    "<b>3rd place, Engati internal thinkathon.</b>",
]))

story += heading("Education")
story.append(left_right(
    "B.E. — Computer Science &amp; Engineering<font name='Helvetica'> · GPA 8.4</font>", ""))
story.append(left_right(
    "Dayananda Sagar College of Engineering, Bengaluru", "2022",
    left_style=role, right_style=date))

# ------------------------------------------------------------------- build

doc = SimpleDocTemplate(
    str(OUT),
    pagesize=A4,
    leftMargin=MARGIN_X,
    rightMargin=MARGIN_X,
    topMargin=40,
    bottomMargin=36,
    title="Advaith Praveen — Senior Frontend Engineer",
    author="Advaith Praveen",
    subject="Resume — Senior Frontend Engineer, Full-Stack & AI",
)
doc.build(story)
print(f"Wrote {OUT}")
