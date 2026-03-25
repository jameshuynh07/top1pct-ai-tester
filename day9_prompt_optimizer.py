import sys
import os
sys.path.insert(0, os.path.expanduser("~/prompt-learning"))

from dotenv import load_dotenv
load_dotenv()

# Arize dùng OpenAI — ta mock bằng cách dùng LangChain trực tiếp
# Implement prompt optimization loop thủ công — hiểu rõ hơn black box

from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
import pandas as pd

llm = ChatAnthropic(model="claude-haiku-4-5-20251001", temperature=0.2)

# ── BƯỚC 1: Prompt ban đầu (chưa tối ưu) ─────────────────
initial_prompt = "Generate a Playwright test case for: {input}"

# ── BƯỚC 2: Meta-prompt — học từ feedback ─────────────────
meta_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a prompt optimization engine.
Given an original prompt, its outputs, and QA feedback on those outputs,
rewrite the prompt to fix all the issues mentioned in the feedback.

The improved prompt must guide the AI to:
- Write complete, executable Playwright TypeScript code
- Always use Page Object Model pattern
- Include happy path AND negative test cases  
- Use robust selectors (getByRole, getByLabel, getByTestId)
- Add proper assertions

Output ONLY the new improved prompt text. No explanation."""),
    ("human", """Original prompt: {original_prompt}

Examples of bad outputs and feedback:
{feedback_examples}

Write an improved prompt that fixes all these issues:""")
])

meta_chain = meta_prompt | llm

# ── BƯỚC 3: Load dataset ──────────────────────────────────
df = pd.read_csv("yoma_qa_dataset.csv")

# Format feedback examples
feedback_examples = ""
for _, row in df.iterrows():
    feedback_examples += f"\nInput: {row['input']}\n"
    feedback_examples += f"Bad output: {row['output']}\n"
    feedback_examples += f"Feedback: {row['feedback']}\n"
    feedback_examples += "---"

print("=" * 60)
print("Arize-style Prompt Learning — Yoma QA Dataset")
print("=" * 60)
print(f"\n📊 Dataset: {len(df)} examples loaded")
print(f"\n🔴 Original prompt:\n   '{initial_prompt}'")

# ── BƯỚC 4: Optimize prompt ───────────────────────────────
print("\n⚙️  Running optimization loop...")
result = meta_chain.invoke({
    "original_prompt": initial_prompt,
    "feedback_examples": feedback_examples
})

optimized_prompt = result.content.strip()

print(f"\n✅ Optimized prompt:")
print("-" * 40)
print(optimized_prompt)
print("-" * 40)

# ── BƯỚC 5: Test optimized prompt vs original ─────────────
test_input = "Yoma car booking with date selection and payment"

test_chain_original = ChatPromptTemplate.from_messages([
    ("system", "You are a QA engineer."),
    ("human", initial_prompt)
]) | llm

test_chain_optimized = ChatPromptTemplate.from_messages([
    ("system", "You are a QA engineer."),
    ("human", optimized_prompt + "\n\nFeature: {input}")
]) | llm

print(f"\n🧪 Test input: '{test_input}'")
print("\n🔴 Output with ORIGINAL prompt (first 300 chars):")
orig_out = test_chain_original.invoke({"input": test_input})
print(orig_out.content[:300] + "...")

print("\n✅ Output with OPTIMIZED prompt (first 300 chars):")
opt_out = test_chain_optimized.invoke({"input": test_input})
print(opt_out.content[:300] + "...")

print("\n" + "=" * 60)
print("Key insight:")
print("Original prompt → vague output")
print("Optimized prompt → detailed, executable POM test")
print("Prompt learning = feed failures → auto-improve prompt")
print("=" * 60)

# Save optimized prompt
with open("optimized_qa_prompt.txt", "w") as f:
    f.write(optimized_prompt)
print("\n💾 Saved to: optimized_qa_prompt.txt")
