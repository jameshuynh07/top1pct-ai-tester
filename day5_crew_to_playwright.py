from crewai import Agent, Task, Crew, LLM
from dotenv import load_dotenv
import os, subprocess, re

load_dotenv()

llm = LLM(model="anthropic/claude-haiku-4-5-20251001")

# ── AGENTS ───────────────────────────────────────────────
writer = Agent(
    role="QA Test Writer",
    goal="Write production-ready Playwright TypeScript tests",
    backstory="""Senior QA engineer. You write Playwright tests that actually run.
Rules:
- POM pattern always
- Use getByRole(), getByLabel(), getByTestId() — never input[type=]
- Credentials from environment variables, not hardcoded
- beforeEach navigates to page
- Output ONLY raw TypeScript, zero markdown""",
    llm=llm,
    verbose=False  # tắt verbose để output gọn hơn
)

reviewer = Agent(
    role="QA Test Reviewer",
    goal="Fix and finalize tests to score 9/10 or higher",
    backstory="""Principal QA engineer. You take a test, fix ALL issues, output final version.
You apply all improvements directly — no list of suggestions, just the fixed code.
Output ONLY raw TypeScript, zero markdown.""",
    llm=llm,
    verbose=False
)

# ── ĐỌC USER STORIES ─────────────────────────────────────
with open("user_stories.txt") as f:
    stories = [l.strip() for l in f if l.strip()]

os.makedirs("tests", exist_ok=True)

results = []

for line in stories[:3]:  # Chạy 3 stories đầu để test nhanh
    story_id = line.split(":")[0].strip().replace("-", "")
    story_text = line.split(":", 1)[1].strip()

    print(f"\n⚙️  Processing {story_id}: {story_text[:50]}...")

    task_write = Task(
        description=f"""Write a Playwright TypeScript test for:
{story_text}

Use: getByRole/getByLabel/getByTestId selectors only.
Load credentials from process.env.TEST_EMAIL and process.env.TEST_PASSWORD.
Include beforeEach with page navigation.
Output ONLY raw TypeScript.""",
        expected_output="Raw TypeScript Playwright test, no markdown",
        agent=writer
    )

    task_review = Task(
        description="""Take the test from the writer.
Fix every issue. Apply all improvements directly.
Final test must score 9/10+.
Output ONLY the final raw TypeScript code — nothing else.""",
        expected_output="Final production-ready TypeScript Playwright test",
        agent=reviewer,
        context=[task_write]
    )

    crew = Crew(
        agents=[writer, reviewer],
        tasks=[task_write, task_review],
        verbose=False
    )

    result = crew.kickoff()
    code = result.raw.strip()

    # Clean markdown fences nếu còn sót
    if code.startswith("```"):
        code = "\n".join(code.split("\n")[1:])
    if code.endswith("```"):
        code = "\n".join(code.split("\n")[:-1])

    filepath = f"tests/{story_id}.spec.ts"
    with open(filepath, "w") as f:
        f.write(code)

    results.append((story_id, filepath))
    print(f"  → Saved: {filepath}")

# ── TẠO PLAYWRIGHT CONFIG ─────────────────────────────────
config = """import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'https://yomacarshare.com',
    headless: true,
  },
});
"""
with open("playwright.config.ts", "w") as f:
    f.write(config)

print(f"\n{'='*60}")
print(f"✅ Generated {len(results)} test files:")
for story_id, path in results:
    print(f"   {story_id} → {path}")
print(f"\nRun with: npx playwright test --reporter=list")
print(f"{'='*60}")
