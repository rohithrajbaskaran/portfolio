// Portfolio content for the driving world. Each zone becomes a landmark on the island.

const gh = (repo) => `https://github.com/rohithrajbaskaran/${repo}`;
const chips = (list) => `<div class="chips">${list.map((c) => `<span class="chip">${c}</span>`).join("")}</div>`;
const links = (list) =>
  `<div class="p-links">${list
    .map(([label, href, primary]) => `<a class="p-btn${primary ? " primary" : ""}" href="${href}" target="_blank" rel="noopener">${label}</a>`)
    .join("")}</div>`;

export const ZONES = [
  {
    id: "about",
    title: "About",
    sub: "Who I am",
    color: "#0a84ff",
    building: "house",
    html: `
      <p class="p-kicker">About</p>
      <h2>Engineer by training.<br><span class="dim">Risk-minded by choice.</span></h2>
      <p class="p-lead">I'm a Toronto-based software engineer who builds AI-powered systems, full-stack apps, and tools for governance, risk, and compliance.</p>
      <p>I've worked across the whole lifecycle: requirements, backend, frontend, testing, deployment, and monitoring. Lately I've been aiming that at GRC by automating IT general controls testing, and writing about why compliance should be the floor, not the ceiling.</p>
      <div class="p-grid">
        <div class="p-card"><b>B.Sc. Computer Science</b><span>Toronto Metropolitan University · 2023–2025</span></div>
        <div class="p-card"><b>AWS Certified Cloud Practitioner</b><span>Earned May 2025</span></div>
      </div>
      <h3>How I work</h3>
      <ul>
        <li><b>Measure the outcome, not the output.</b> "Incident search 20% faster" beats "shipped a search feature".</li>
        <li><b>Trust, but verify, then automate.</b> From 92% test coverage to audit trails on AI findings.</li>
        <li><b>Keep humans in the loop.</b> AI should speed up judgment, not replace it.</li>
      </ul>
      <h3>Coursework</h3>
      ${chips(["Data Structures & Algorithms", "Software Engineering", "Operating Systems", "Machine Learning", "Networks & Security", "Database Design", "Systems Programming", "Web Development", "UX Design"])}
    `,
  },
  {
    id: "plutus",
    title: "Plutus Consultancy",
    sub: "Software Engineer · 2025",
    color: "#5e5ce6",
    building: "tower",
    html: `
      <p class="p-kicker">Experience · Sep 2025 – Dec 2025</p>
      <h2>Software Engineer <span class="dim">(Application Engineer)</span></h2>
      <p class="p-lead">Plutus Consultancy · Toronto, ON</p>
      <div class="p-stats"><div><b>20%+</b><span>faster incident search</span></div><div><b>60%</b><span>less manual processing</span></div><div><b>3+</b><span>teams collaborated with</span></div></div>
      <ul>
        <li>Designed and shipped an <b>AI-powered semantic search platform</b> in Python and Flask, with REST endpoints and vector similarity search over PostgreSQL/pgvector.</li>
        <li>Built backend services and React components across the full SDLC with 3+ cross-functional teams in Agile/Scrum.</li>
        <li>Automated data ingestion and ETL workflows in Python, improving data integrity across services.</li>
        <li>Deployed and ran cloud-hosted apps on Linux, owning configuration, releases, troubleshooting, and monitoring.</li>
      </ul>
      ${chips(["Python", "Flask", "PostgreSQL", "pgvector", "React", "REST APIs", "Linux", "Git"])}
    `,
  },
  {
    id: "eatme",
    title: "EatMe Global",
    sub: "QE Intern · 2019",
    color: "#ff9f0a",
    building: "shop",
    html: `
      <p class="p-kicker">Experience · Jun 2019 – Sep 2019</p>
      <h2>Software Engineering Intern, <span class="dim">Quality Engineering</span></h2>
      <p class="p-lead">EatMe Global</p>
      <div class="p-stats"><div><b>92%</b><span>code coverage</span></div><div><b>25%</b><span>fewer post-release defects</span></div></div>
      <ul>
        <li>Wrote automated regression and integration suites in JavaScript and Java (Cypress, JUnit, Enzyme) for a React, Node.js, GraphQL, and PostgreSQL app.</li>
        <li>Turned functional requirements into specs and test scenarios across functional, integration, and UAT testing.</li>
        <li>Debugged and validated Redis caching, JWT authentication, and REST/GraphQL integrations.</li>
        <li>Triaged and root-caused defects with engineering leads using Git-based workflows.</li>
      </ul>
      ${chips(["JavaScript", "Java", "Cypress", "JUnit", "Enzyme", "GraphQL", "Redis", "JWT"])}
    `,
  },
  {
    id: "itgc",
    title: "ITGC Audit Agent",
    sub: "AI × GRC · 2026",
    color: "#30d158",
    building: "servers",
    html: `
      <p class="p-kicker">Featured project · 2026</p>
      <h2>AI-Powered ITGC Audit Assistant</h2>
      <p class="p-lead">A multi-agent system that automates IT general controls testing for access management, change management, and MFA.</p>
      <div class="p-mock">
        <div class="f"><span class="sev hi">HIGH</span>Orphaned account: terminated user still active<em>COBIT DSS05.04 · NIST PR.AA</em></div>
        <div class="f"><span class="sev hi">HIGH</span>MFA not enforced on privileged account<em>COBIT DSS05.04 · NIST PR.AA</em></div>
        <div class="f"><span class="sev md">MED</span>Production change without approval record<em>COBIT BAI06.01 · NIST PR.PS</em></div>
        <div class="ok">✓ Auditor sign-off required before findings are final</div>
      </div>
      <ul>
        <li>Maps every finding to <b>COBIT 2019</b> and <b>NIST CSF 2.0</b>.</li>
        <li>Detects orphaned accounts, MFA gaps, and unapproved changes, cutting review time.</li>
        <li>AI governance built in: human-in-the-loop review and audit trails aligned with the <b>NIST AI RMF</b>.</li>
      </ul>
      ${chips(["Python", "LangGraph", "Claude API", "Pandas", "Streamlit", "GRC frameworks"])}
      ${links([["View on GitHub", gh("itgc-audit-agent"), true]])}
    `,
  },
  {
    id: "rag",
    title: "Incident RAG",
    sub: "Retrieval · 2025",
    color: "#64d2ff",
    building: "database",
    html: `
      <p class="p-kicker">Featured project · Nov – Dec 2025</p>
      <h2>RAG Pipeline for IT Incident Resolution</h2>
      <p class="p-lead">Describe a problem and get the closest resolved incident back, with a confidence score.</p>
      <div class="p-mock light">
        <div class="q">🔍 VPN drops every few minutes after login</div>
        <div class="m"><span>VPN client disconnects intermittently</span><b>0.91</b><i style="--w:91%"></i></div>
        <div class="m"><span>Remote access session timeout</span><b>0.78</b><i style="--w:78%"></i></div>
      </div>
      <ul>
        <li>Embeds incident descriptions as vectors with <b>all-MiniLM-L6-v2</b>, then runs cosine similarity search to return the best match.</li>
        <li>Imports ServiceNow Excel exports with automatic column detection.</li>
        <li>Full-stack app with RESTful endpoints for incident creation, tracking, and lifecycle management.</li>
      </ul>
      ${chips(["RAG", "React", "Node.js", "Express", "MongoDB", "Flask", "pgvector", "Sentence Transformers"])}
      ${links([["View on GitHub", gh("incident-resolution"), true]])}
    `,
  },
  {
    id: "autofill",
    title: "Job Autofill",
    sub: "Chrome extension · 2026",
    color: "#ff375f",
    building: "monitor",
    html: `
      <p class="p-kicker">Featured project · Jul – Aug 2026</p>
      <h2>Automated Job Application Engine</h2>
      <p class="p-lead">A Manifest V3 Chrome extension that fills job applications, including repeated employment history, in seconds.</p>
      <ul>
        <li>Heuristic field-matching engine with <b>25+ regex classifiers</b> across labels, ARIA attributes, and placeholders.</li>
        <li>DOM parsing with container containment and positional pairing to fill repeated sections like work history.</li>
        <li>Popup UI, content script, and service worker, with native-setter injection and fuzzy matching for React/Vue compatibility.</li>
      </ul>
      ${chips(["JavaScript", "Manifest V3", "DOM APIs", "HTML5/CSS3", "JSON"])}
      ${links([["View on GitHub", gh("job_application_autofiller"), true]])}
    `,
  },
  {
    id: "finbud",
    title: "FinBud",
    sub: "Full-stack · Live",
    color: "#bf5af2",
    building: "chart",
    html: `
      <p class="p-kicker">Featured project · Full-stack</p>
      <h2>FinBud</h2>
      <p class="p-lead">A money management app for university students to log daily spending, see where it goes, and plan monthly budgets.</p>
      <ul>
        <li>Expense tracking with category summaries and trends.</li>
        <li>Monthly budget targets per category with instant feedback.</li>
        <li>Authentication, responsive design, deployed on Vercel.</li>
      </ul>
      ${chips(["React", "Node.js", "Express", "MySQL", "Vercel"])}
      ${links([["Live demo", "https://fin-bud-eight.vercel.app/signin", true], ["View on GitHub", gh("FinBud")]])}
    `,
  },
  {
    id: "archive",
    title: "Repo Garage",
    sub: "More on GitHub",
    color: "#8e8e93",
    building: "garage",
    html: `
      <p class="p-kicker">More on GitHub</p>
      <h2>Everything else I've built.</h2>
      <div class="repos">
        <a href="${gh("logAnalyzer")}" target="_blank" rel="noopener"><b>logAnalyzer</b><span>Pure-Bash Apache/Nginx log analyzer: top IPs, status codes, 404s, hourly traffic, ASCII charts.</span><em>Shell</em></a>
        <a href="https://rohithrajbaskaran.github.io/clusterAnalysis/" target="_blank" rel="noopener"><b>clusterAnalysis</b><span>E-commerce segmentation with K-Means and elbow optimization, written up as an executive report.</span><em>Python · Report</em></a>
        <a href="https://rohithrajbaskaran.github.io/supabase_case_analysis/" target="_blank" rel="noopener"><b>Supabase case analysis</b><span>A warehouse-centric customer data architecture for product-led growth, with a PQL framework.</span><em>GTM engineering</em></a>
        <a href="https://rohithrajbaskaran.github.io/QA_portfolio/" target="_blank" rel="noopener"><b>QA portfolio</b><span>My quality engineering and test automation work.</span><em>Site</em></a>
        <a href="https://rohithrajbaskaran.github.io/taprobane/" target="_blank" rel="noopener"><b>Taprobane</b><span>No-build marketing site for a Colombo hardware supplier, with quote form and logo set.</span><em>HTML · CSS · JS</em></a>
      </div>
      ${links([["All repositories", "https://github.com/rohithrajbaskaran?tab=repositories", true]])}
    `,
  },
  {
    id: "writing",
    title: "The Library",
    sub: "Writing",
    color: "#ffd60a",
    building: "book",
    html: `
      <p class="p-kicker">Writing · Oct 9, 2026 · 9 min read</p>
      <h2>What GRC Actually Is <span class="dim">(and Why It's More Than Checkbox Compliance)</span></h2>
      <p class="p-lead">Target was certified PCI compliant two months before attackers took data on 40 million payment cards.</p>
      <p>A plain-English explainer on governance, risk, and compliance: what each part means, what checkbox compliance looks like, the lessons from the Target and Equifax breaches, and what mature GRC looks like in practice.</p>
      <blockquote>A compliance check is a snapshot of one day. Security depends on whether controls work every day, and on someone owning them.</blockquote>
      ${links([["Read the article", "../blog/grc-beyond-checkbox-compliance.html", true]])}
      <p class="dim small">Up next: how to build a simple risk register from scratch.</p>
    `,
  },
  {
    id: "skills",
    title: "Skill Crates",
    sub: "Drive through them",
    color: "#ff9f0a",
    building: "crates",
    html: `
      <p class="p-kicker">Toolkit</p>
      <h2>Smash the crates.<br><span class="dim">Keep the skills.</span></h2>
      <h3>Languages</h3>
      ${chips(["Python", "Java", "JavaScript", "TypeScript", "C#", "C++", "SQL", "Bash", "HTML5", "CSS3"])}
      <h3>Frameworks & libraries</h3>
      ${chips(["React", "Node.js", "Express.js", "Flask", "TailwindCSS", "REST APIs", "GraphQL", "JUnit", "Cypress"])}
      <h3>Data & AI</h3>
      ${chips(["PostgreSQL", "pgvector", "MySQL", "MongoDB", "Oracle", "Redis", "Schema design", "Query optimization", "LangGraph", "Claude API"])}
      <h3>Cloud & DevOps</h3>
      ${chips(["AWS", "Docker", "Git & GitHub", "GitHub Actions", "CI/CD", "Linux/Unix", "Vercel", "Postman", "JIRA", "Azure DevOps"])}
      <h3>Security & GRC</h3>
      ${chips(["NIST CSF 2.0", "COBIT 2019", "NIST AI RMF", "ISO/IEC 27001", "SOC 2", "PCI DSS", "ITGC testing"])}
    `,
  },
  {
    id: "contact",
    title: "Contact",
    sub: "Let's talk",
    color: "#ff453a",
    building: "mailbox",
    html: `
      <p class="p-kicker">Contact</p>
      <h2>Let's build something <span class="grad">smart and secure.</span></h2>
      <p class="p-lead">I'm open to software engineering, application engineering, and security/GRC engineering roles. Email is the fastest way to reach me.</p>
      <div class="contact">
        <div><span>Email</span><b>baskaranrohithraj@gmail.com</b><button type="button" data-copy="baskaranrohithraj@gmail.com">Copy</button></div>
        <a href="https://www.linkedin.com/in/rohithraj-baskaran-89029820b/" target="_blank" rel="noopener"><span>LinkedIn</span><b>rohithraj-baskaran</b></a>
        <a href="https://github.com/rohithrajbaskaran" target="_blank" rel="noopener"><span>GitHub</span><b>rohithrajbaskaran</b></a>
      </div>
      ${links([["Email me", "mailto:baskaranrohithraj@gmail.com", true], ["Download résumé", "../assets/Rohithraj_Baskaran_Resume.pdf"]])}
    `,
  },
];

// Impact numbers are collectibles scattered on the ring road.
export const TOKENS = [
  { value: "20%+", label: "faster incident search", color: "#0a84ff" },
  { value: "60%", label: "less manual ETL effort", color: "#bf5af2" },
  { value: "92%", label: "test coverage", color: "#30d158" },
  { value: "25%", label: "fewer post-release defects", color: "#ff9f0a" },
];

export const SKILL_CRATES = [
  "Python", "Java", "JavaScript", "TypeScript", "SQL", "React",
  "Node.js", "Flask", "PostgreSQL", "pgvector", "MongoDB",
  "AWS", "Docker", "Linux", "Redis",
  "LangGraph", "Claude API", "Cypress",
  "GraphQL", "Git",
];
