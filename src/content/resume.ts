/**
 * ─────────────────────────────────────────────────────────────
 *  RESUME
 * ─────────────────────────────────────────────────────────────
 * Everything on /resume comes from this file. Text is copied word for
 * word from the resume; edit it here when the resume changes.
 *
 * Phone number and email are intentionally not included on the web page.
 * They stay in the downloadable PDF.
 */

export type ResumeRole = {
  title: string;
  dates: string;
  bullets: string[];
};

export type ResumeEntry = {
  org: string;
  /** Short description shown after the organization name. */
  detail?: string;
  /** Lines shown under the organization name, one per line (used in Education). */
  lines?: string[];
  location?: string;
  /** Single-role entries put their title/dates here... */
  dates?: string;
  bullets?: string[];
  /** ...multi-role entries (like PwC) list each role. */
  roles?: ResumeRole[];
};

export type ResumeSection = {
  id: string;
  title: string;
  entries: ResumeEntry[];
};

export type Resume = {
  name: string;
  sections: ResumeSection[];
  skills: string[];
  languages: string[];
  interests: string[];
};

export const resume: Resume = {
  name: "Frances Rose Weseley",

  sections: [
    {
      id: "education",
      title: "Education",
      entries: [
        {
          org: "Wellesley College",
          lines: ["B.A. Majors: Computer Science and Economics", "GPA: 3.7"],
          dates: "May 2025",
          location: "Wellesley, MA",
        },
        {
          org: "Massachusetts Institute of Technology (MIT)",
          lines: ["Cross-Registered Student"],
          dates: "Jan 2022 - 2025",
          location: "Cambridge, MA",
          bullets: [
            "Took six graduate-level courses in Finance and Computer Science counting towards GPA for B.A. degree",
          ],
        },
      ],
    },
    {
      id: "experience",
      title: "Professional Experience",
      entries: [
        {
          org: "PricewaterhouseCoopers (PwC)",
          location: "New York, NY",
          roles: [
            {
              title: "Strategy Consulting Associate",
              dates: "Aug 2025 - Present",
              bullets: [
                "Developed a multi-billion-dollar transformation strategy and conducted a global health check for a Global Systemically Important Bank by creating executive presentations, financial models, and operational analyses",
                "Serve as team’s primary AI resource, developing agents that improve internal operations",
                "Manage financial oversight for $40M+ account, partnering directly with senior leadership to monitor budget and inform strategic decisions, and coordinate ~200 people across technology, cyber, operations, and data",
                "Support leadership team driving TMT market expansion strategy through target account research, pipeline development, weekly executive working sessions, and synthesis of strategic planning discussions",
                "Identified $1B revenue client’s needs and collaborated with engineers to build custom product features",
              ],
            },
            {
              title: "Engineering Intern",
              dates: "Jun - Aug 2024",
              bullets: [
                "Trained model using Python and AWS to classify reports cutting manual review time and costs",
                "Performed comparative analysis of classification methods and built datasets for presentation to client",
              ],
            },
          ],
        },
        {
          org: "MIT",
          detail: "Research Assistant",
          dates: "Jan 2022 - Apr 2024",
          location: "Cambridge, MA",
          bullets: [
            "Analyzed inflation’s effect on the market using Python; layered statistical methods to identify and model trends",
            "Designed Python models to analyze Ethereum merge by scraping Etherscan API; graphed results to visualize trends",
          ],
        },
        {
          org: "All Day",
          detail: "Consultant - Startup with $5M raised",
          dates: "Sep - Dec 2023",
          location: "Cambridge, MA",
          bullets: [
            "Led beta-testing program with 50+ users to build product roadmap; selected as CEO’s point of contact",
          ],
        },
        {
          org: "Dark Forest Technologies",
          detail: "Intern - Hedge Fund, ~$2.4B Assets Under Management",
          dates: "Jun - Aug 2023",
          location: "New York, NY",
          bullets: [
            "Evaluated trading strategies using Python, GCP, & BigQuery for fund with $500M in assets under management",
            "Collaborated with quantitative researchers on execution analysis of global, cross-asset, high-volume trades",
          ],
        },
        {
          org: "LT Burger",
          detail: "Cafe Manner / Hostess",
          dates: "Summer 2017, 2018 and 2019",
          location: "Sag Harbor, NY",
          bullets: [
            "Provided customer support, constantly multitasked, and trained new hires; frequent 14-hour double shifts",
          ],
        },
      ],
    },
    {
      id: "leadership",
      title: "Leadership & Projects",
      entries: [
        {
          org: "TCS NYC Marathon Finisher",
          dates: "November 2026",
          bullets: [
            "Fundraised $7,000+ for MSK breast cancer research by individually pitching ~1000 strangers across NYC to win a social media competition, homemade alfajor bakesales, and donations",
          ],
        },
        {
          org: "President, Wellesley Asset Management & Finance Club",
          dates: "Sep 2022 - May 2025",
          bullets: [
            "Managed E-board recruiting and delegated duties; ran biweekly E-board meetings and coordinated all club events",
          ],
        },
        {
          org: "Wellesley College Varsity Field Hockey",
          dates: "Aug 2021 - May 2023",
          bullets: ["Starting center attacking midfielder, named to NEWMAC Academic All-Conference 2022"],
        },
        {
          org: "Team USA Field Hockey, Maccabiah Games",
          dates: "May 2021 - Aug 2022",
          bullets: [
            "Gold medalist; represented U.S.A. at world’s second-largest international multi-sport event",
          ],
        },
      ],
    },
  ],

  skills: ["Python", "R", "Java", "C#", "HTML", "CSS", "JavaScript", "GCP", "AWS", "Stata", "Microsoft Office"],
  languages: ["Spanish/English (native)", "French (conversational)"],
  interests: ["Baking", "tennis", "travel", "fashion"],
};
