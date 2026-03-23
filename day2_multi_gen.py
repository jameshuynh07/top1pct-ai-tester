from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()

llm = ChatAnthropic(model="claude-haiku-4-5-20251001", temperature=0.2)

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a QA engineer.
Given a feature description, write ONE Playwright test case in TypeScript.
Use Page Object Model style. Output ONLY the TypeScript code, no markdown, no explanation."""),
    ("human", "Feature: {feature}")
])

chain = prompt | llm

# --- Yoma Car Share features ---
features = [
    "User can log in with valid email and password",
    "User sees error message when logging in with wrong password",
    "User can browse available cars on the home page",
    "User can select a car and view its booking details",
    "User cannot book a car if they are not logged in",
]

os.makedirs("generated_tests", exist_ok=True)

for i, feature in enumerate(features, 1):
    print(f"[{i}/{len(features)}] Generating: {feature}")
    result = chain.invoke({"feature": feature})

    # Clean output — strip markdown fences if any
    code = result.content.strip()
    if code.startswith("```"):
        lines = code.split("\n")
        code = "\n".join(lines[1:-1])

    filename = f"generated_tests/tc_{i:02d}_{feature[:30].replace(' ','_').lower()}.spec.ts"
    with open(filename, "w") as f:
        f.write(code)
    print(f"  → Saved: {filename}")

print("\n✅ Done! Check generated_tests/ folder.")
