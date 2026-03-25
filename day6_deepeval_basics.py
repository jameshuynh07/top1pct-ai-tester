from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

llm = ChatAnthropic(model="claude-haiku-4-5-20251001", temperature=0)

# ── EVALUATOR PROMPT ─────────────────────────────────────
# Đây chính là cách DeepEval hoạt động bên trong:
# Dùng LLM để judge câu trả lời thay vì exact match
eval_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a QA evaluator. Given a question and an answer,
score how relevant the answer is to the question.

Score from 0.0 to 1.0:
- 1.0: Answer directly and completely addresses the question
- 0.7: Answer is relevant but missing some details  
- 0.4: Answer is partially relevant
- 0.1: Answer is off-topic or irrelevant

Respond in this exact format:
SCORE: <number>
REASON: <one sentence explanation>"""),
    ("human", "QUESTION: {question}\nANSWER: {answer}")
])

eval_chain = eval_prompt | llm

def evaluate(question, answer, threshold=0.7):
    """Non-deterministic assertion — judge bằng LLM thay vì exact match"""
    result = eval_chain.invoke({"question": question, "answer": answer})
    
    lines = result.content.strip().split("\n")
    score = float(lines[0].replace("SCORE:", "").strip())
    reason = lines[1].replace("REASON:", "").strip()
    passed = score >= threshold
    
    return {"score": score, "reason": reason, "passed": passed}

# ── TEST CASES ───────────────────────────────────────────
question = "How do I book a car on Yoma Car Share?"

cases = {
    "GOOD": "Select your pickup location, choose dates, pick an available car, and tap Confirm Booking. You'll get a confirmation email.",
    "BAD" : "Yoma Fleet is a company based in Myanmar providing fleet management solutions.",
    "OK"  : "You can book a car by logging into the app.",
}

print("=" * 60)
print("Non-Deterministic Assertion Demo — Claude as Judge")
print("=" * 60)
print(f"Question: {question}")
print(f"Threshold: 0.7\n")

for name, answer in cases.items():
    result = evaluate(question, answer, threshold=0.7)
    status = "✅ PASS" if result["passed"] else "❌ FAIL"
    print(f"[{name}] {status}")
    print(f"  Score : {result['score']:.2f}")
    print(f"  Reason: {result['reason']}")
    print()

print("=" * 60)
print("Key insight:")
print("GOOD → score cao → PASS (đúng ý dù khác từ)")
print("BAD  → score thấp → FAIL (lạc đề hoàn toàn)")  
print("OK   → borderline → tuỳ threshold")
print("=" * 60)
