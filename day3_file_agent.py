from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()

llm = ChatAnthropic(model="claude-haiku-4-5-20251001", temperature=0.2)

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a senior QA engineer.
Given a user story, write ONE Playwright TypeScript test using POM style.
Output ONLY raw TypeScript code. No markdown, no explanation, no backticks."""),
    ("human", "User story: {story}")
])

chain = prompt | llm

# --- Đọc file user_stories.txt ---
with open("user_stories.txt", "r") as f:
    lines = [l.strip() for l in f.readlines() if l.strip()]

os.makedirs("generated_tests_v2", exist_ok=True)

for line in lines:
    # Lấy ID: "US-001" từ "US-001: User can..."
    story_id = line.split(":")[0].strip().replace("-", "")  # US001
    story_text = line.split(":", 1)[1].strip()

    print(f"Generating {story_id}: {story_text[:50]}...")

    result = chain.invoke({"story": story_text})

    code = result.content.strip()
    # Clean markdown fences nếu có
    if code.startswith("```"):
        code = "\n".join(code.split("\n")[1:-1])

    filename = f"generated_tests_v2/tc_{story_id}.spec.ts"
    with open(filename, "w") as f:
        f.write(code)
    print(f"  → Saved: {filename}")

print(f"\n✅ Done! {len(lines)} tests generated in generated_tests_v2/")
