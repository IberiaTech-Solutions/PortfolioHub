from fpdf import FPDF

class RoadmapPDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 24)
        self.set_text_color(79, 70, 229)  # brand indigo
        self.cell(0, 15, "PortfolioHub", new_x="LMARGIN", new_y="NEXT", align="C")
        self.set_font("Helvetica", "", 12)
        self.set_text_color(100, 116, 139)  # slate-500
        self.cell(0, 8, "Product Roadmap 2026", new_x="LMARGIN", new_y="NEXT", align="C")
        self.ln(5)
        # Divider line
        self.set_draw_color(79, 70, 229)
        self.set_line_width(0.5)
        self.line(20, self.get_y(), 190, self.get_y())
        self.ln(8)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 10, f"PortfolioHub Roadmap  |  Page {self.page_no()}/{{nb}}", align="C")

    def section_title(self, title, color):
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(*color)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def task_item(self, text, done=False):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 41, 59)  # slate-800
        checkbox = "[x]" if done else "[ ]"
        self.set_font("Courier", "", 10)
        self.cell(10, 7, checkbox)
        self.set_font("Helvetica", "", 10)
        self.multi_cell(0, 7, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def description(self, text):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(100, 116, 139)
        self.multi_cell(0, 6, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(4)


pdf = RoadmapPDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=20)
pdf.add_page()

# Vision
pdf.set_font("Helvetica", "I", 11)
pdf.set_text_color(71, 85, 105)
pdf.multi_cell(0, 7,
    "AI-powered talent platform where candidates control their narrative and recruiters "
    "evaluate depth - not keywords. Inspired by the broken hiring pipeline (0.4% success rate) "
    "and the need for a centralized hub that solves distribution, trust, and matching.",
    new_x="LMARGIN", new_y="NEXT"
)
pdf.ln(8)

# Priority 1
pdf.section_title("PRIORITY 1 - Ship Now (High Impact)", (16, 185, 129))  # emerald

items_p1 = [
    ("Verified by PortfolioHub trust badge",
     "AI only uses verified portfolio data, not candidate-controlled prompts. Badge displayed on profiles to build recruiter trust."),
    ("Privacy controls per field",
     "Users mark fields as public/private. NDA-safe mode so people can list skills without exposing proprietary details."),
    ("Profile view analytics",
     "Track views, AI chats, and fit assessments per profile. Dashboard showing '5 people viewed your profile, 2 chatted with your AI.'"),
    ("Vanity URLs",
     "portfoliohub.com/username instead of /portfolio/uuid. Shareable in emails, LinkedIn bios, and resumes."),
    ("Suggested jobs on profile page",
     "When candidates view their own profile, show top matching jobs with AI scores. Passive value that keeps them engaged."),
]

for title, desc in items_p1:
    pdf.task_item(title)
    pdf.description(desc)

# Priority 2
pdf.section_title("PRIORITY 2 - Differentiators (What Nobody Else Has)", (79, 70, 229))  # brand

items_p2 = [
    ("AI-to-AI matching",
     "Recruiter posts a job, system auto-scores ALL candidates and surfaces top 10 matches. No browsing needed."),
    ("'Don't Apply' honest signal",
     "Visually flag jobs where candidate scores below 30. 'Save your time - this isn't a match.' Builds trust like nothing else."),
    ("Shareable fit assessment cards",
     "Generate shareable image/link after fit assessment. 'Luis scored 87% for Senior Frontend at Stripe.' Free distribution via social media."),
    ("Recruiter dashboard",
     "Saved searches, candidate shortlists, bulk AI chat ('ask all 10 candidates about distributed systems'), outreach tools."),
    ("Weekly AI career digest email",
     "'3 new jobs match your profile this week. Top match: Senior Dev at Acme (92%).' Keeps users engaged without opening the app."),
]

for title, desc in items_p2:
    pdf.task_item(title)
    pdf.description(desc)

# Priority 3
pdf.section_title("PRIORITY 3 - Moat Builders (Hard to Copy)", (147, 51, 234))  # purple

items_p3 = [
    ("Voice/video AI agent",
     "Candidates record a 2-min intro video. AI references it in chat: 'Hear Luis explain his approach to system design.'"),
    ("Skill verification challenges",
     "AI-generated coding/design challenges that add a 'Verified: React (Advanced)' badge. Solves 'anyone can claim skills.'"),
    ("Collaboration graph",
     "Visual network of verified collaborations. 'Luis collaborated with 3 verified engineers on 2 projects.' Hard to fake."),
    ("Portfolio SEO pages",
     "Meta tags, Open Graph images, structured data per profile. When someone Googles 'Luis Lozoya developer,' PortfolioHub ranks."),
    ("API for ATS integration",
     "Let companies pull candidate data into Workday/Greenhouse/Lever. Gateway to enterprise adoption."),
]

for title, desc in items_p3:
    pdf.task_item(title)
    pdf.description(desc)

# Priority 4
pdf.section_title("PRIORITY 4 - Monetization", (245, 158, 11))  # amber

items_p4 = [
    ("Free tier",
     "Profile + 5 AI chat messages/day + basic fit assessment."),
    ("Pro tier ($9/mo)",
     "Unlimited AI chat, vanity URL, analytics, weekly digest, priority in search results."),
    ("Recruiter tier ($49/mo)",
     "Dashboard, bulk AI chat, candidate shortlists, AI-to-AI matching, advanced filters."),
    ("Featured profiles",
     "Pay to appear at top of search results for specific skills. Non-intrusive monetization."),
]

for title, desc in items_p4:
    pdf.task_item(title)
    pdf.description(desc)

# Completed section
pdf.section_title("COMPLETED", (16, 185, 129))

completed = [
    "AI Chat on portfolio pages",
    "Fit Assessment tool (paste job description, get honest score)",
    "Jobs listing page with filters",
    "AI Job Match scoring per job",
    "Post a Job page",
    "Jobs table migration with RLS policies",
    "Navigation updated with Jobs link",
]

for item in completed:
    pdf.task_item(item, done=True)

pdf.output("/Users/luis/Github/PortfolioHub/PortfolioHub_Roadmap.pdf")
print("PDF generated successfully!")
