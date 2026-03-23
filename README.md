# Top 1% AI Tester — Week 1 Pipeline

AI-powered Playwright test generation using LangChain + CrewAI + Anthropic Claude.

## What This Does

Reads user stories → AI Writer generates Playwright tests → AI Reviewer improves them → saves production-ready `.spec.ts` files.

## Stack

- Python 3.12 + LangChain 1.2.x + CrewAI 1.11
- Anthropic Claude Haiku (fast + cheap)
- Playwright TypeScript + POM pattern

## Pipeline
```
user_stories.txt → LangChain chain → CrewAI Writer+Reviewer → tests/*.spec.ts → npx playwright test
```

## Run It
```bash
python -m venv venv && source venv/bin/activate
pip install langchain langchain-anthropic crewai python-dotenv
echo "ANTHROPIC_API_KEY=sk-ant-xxx" > .env
python day5_crew_to_playwright.py
npx playwright test --reporter=list
```

## Key Learnings

- LangChain 1.2.x agent APIs unstable → use simple chain pattern
- CrewAI stable for multi-agent orchestration
- Failing tests = living bug reports, not broken pipeline
- AI gen tests need real app URLs + selectors to pass

## Files

| File | Purpose |
|------|---------|
| `day1_hello_agent.py` | First LangChain call |
| `day2_multi_gen.py` | Batch gen 5 tests |
| `day3_file_agent.py` | Read file → gen 8 tests |
| `day4_crew.py` | Writer + Reviewer agents |
| `day5_crew_to_playwright.py` | Full pipeline → Playwright |
