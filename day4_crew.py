from crewai import Agent, Task, Crew, LLM
from dotenv import load_dotenv

load_dotenv()

# CrewAI dùng LLM wrapper riêng
llm = LLM(model="anthropic/claude-haiku-4-5-20251001")

# ── AGENT 1: Writer ──────────────────────────────────────
writer = Agent(
    role="QA Test Writer",
    goal="Write clean Playwright TypeScript tests using Page Object Model",
    backstory="""You are a senior QA engineer with 10 years experience.
You write precise, readable Playwright tests. You always use POM pattern.
You output ONLY raw TypeScript code — no markdown, no explanation.""",
    llm=llm,
    verbose=True
)

# ── AGENT 2: Reviewer ────────────────────────────────────
reviewer = Agent(
    role="QA Test Reviewer",
    goal="Review Playwright tests and provide quality score + improvements",
    backstory="""You are a principal QA engineer who reviews test code.
You check for: POM usage, assertion quality, edge cases covered, selector robustness.
You give a score 1-10 and list specific improvements needed.""",
    llm=llm,
    verbose=True
)

# ── USER STORY INPUT ─────────────────────────────────────
user_story = "User can log in with valid email and password. Show error if credentials are wrong."

# ── TASK 1: Writer gen test ───────────────────────────────
task_write = Task(
    description=f"""Write a Playwright TypeScript test for this user story:

{user_story}

Requirements:
- Use Page Object Model (LoginPage class)
- Cover BOTH happy path AND error case
- Use proper assertions
- Output ONLY raw TypeScript code""",
    expected_output="Raw TypeScript Playwright test code using POM pattern",
    agent=writer
)

# ── TASK 2: Reviewer critique ────────────────────────────
task_review = Task(
    description="""Review the Playwright test written by the QA Test Writer.

Evaluate:
1. POM pattern used correctly? (2 pts)
2. Happy path covered? (2 pts)
3. Error/negative case covered? (2 pts)
4. Assertions strong enough? (2 pts)
5. Selectors robust (not fragile)? (2 pts)

Output format:
SCORE: X/10
STRENGTHS: (list what's good)
IMPROVEMENTS: (list specific changes needed)
REVISED_TEST: (write the improved version if score < 8)""",
    expected_output="Score, strengths, improvements, and optionally revised test",
    agent=reviewer,
    context=[task_write]  # Reviewer thấy output của Writer
)

# ── CREW: 2 agents làm việc cùng nhau ────────────────────
crew = Crew(
    agents=[writer, reviewer],
    tasks=[task_write, task_review],
    verbose=True
)

print("🚀 Crew kickoff — 2 agents đang làm việc...\n")
result = crew.kickoff()

print("\n" + "="*60)
print("FINAL OUTPUT:")
print("="*60)
print(result.raw)
