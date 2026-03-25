from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

llm = ChatAnthropic(model="claude-haiku-4-5-20251001", temperature=0)

# ── METRIC 1: Answer Relevancy ────────────────────────────
# Câu trả lời có liên quan đến câu hỏi không?
relevancy_prompt = ChatPromptTemplate.from_messages([
    ("system", """Score how relevant the answer is to the question (0.0-1.0).
1.0 = directly answers. 0.7 = relevant but incomplete. 0.4 = partial. 0.1 = off-topic.
Format:
SCORE: <number>
REASON: <one sentence>"""),
    ("human", "QUESTION: {question}\nANSWER: {answer}")
])

# ── METRIC 2: Faithfulness ────────────────────────────────
# AI có bịa thêm thông tin không có trong context không?
faithful_prompt = ChatPromptTemplate.from_messages([
    ("system", """Given a context and an answer, score if the answer ONLY uses information from the context (0.0-1.0).
1.0 = only uses context. 0.5 = mostly accurate, minor additions. 0.0 = fabricates facts not in context.
Format:
SCORE: <number>
REASON: <one sentence>"""),
    ("human", "CONTEXT: {context}\nANSWER: {answer}")
])

# ── METRIC 3: Hallucination ───────────────────────────────
# AI có "bịa" thông tin sai không?
hallucination_prompt = ChatPromptTemplate.from_messages([
    ("system", """Check if the answer contains hallucinated (made-up) information not grounded in reality (0.0-1.0).
0.0 = heavy hallucination. 0.5 = some uncertain claims. 1.0 = all facts verifiable.
Format:
SCORE: <number>
REASON: <one sentence>"""),
    ("human", "ANSWER: {answer}")
])

r_chain = relevancy_prompt | llm
f_chain = faithful_prompt | llm
h_chain = hallucination_prompt | llm

def parse(content):
    lines = content.strip().split("\n")
    score = float(lines[0].replace("SCORE:", "").strip())
    reason = lines[1].replace("REASON:", "").strip()
    return score, reason

def run_metrics(label, question, answer, context=None):
    print(f"\n{'─'*60}")
    print(f"🧪 Test: {label}")
    print(f"   Q: {question[:60]}...")
    print(f"   A: {answer[:70]}...")
    print()

    # Metric 1: Relevancy
    r = r_chain.invoke({"question": question, "answer": answer})
    rs, rr = parse(r.content)
    print(f"  [Relevancy]    {'✅' if rs >= 0.7 else '❌'} {rs:.2f} — {rr}")

    # Metric 2: Faithfulness (nếu có context)
    if context:
        f = f_chain.invoke({"context": context, "answer": answer})
        fs, fr = parse(f.content)
        print(f"  [Faithfulness] {'✅' if fs >= 0.7 else '❌'} {fs:.2f} — {fr}")

    # Metric 3: Hallucination
    h = h_chain.invoke({"answer": answer})
    hs, hr = parse(h.content)
    print(f"  [Hallucination]{'✅' if hs >= 0.7 else '❌'} {hs:.2f} — {hr}")

# ── YOMA CAR SHARE SCENARIOS ─────────────────────────────
print("=" * 60)
print("Yoma Car Share — AI Output Evaluation")
print("=" * 60)

# Scenario 1: Chatbot booking support — câu trả lời tốt
run_metrics(
    label="Booking chatbot — good answer",
    question="How long can I rent a car on Yoma Car Share?",
    answer="You can rent a car for a minimum of 1 day up to 30 days. Select your preferred duration during the booking process.",
    context="Yoma Car Share allows rentals from 1 day minimum to 30 days maximum."
)

# Scenario 2: Chatbot — câu trả lời bịa thông tin
run_metrics(
    label="Booking chatbot — hallucinated answer",
    question="How long can I rent a car on Yoma Car Share?",
    answer="You can rent for 1 hour minimum. Yoma also offers a premium subscription at $50/month for unlimited rentals.",
    context="Yoma Car Share allows rentals from 1 day minimum to 30 days maximum."
)

# Scenario 3: Search result — liên quan
run_metrics(
    label="Car search result — relevant",
    question="Show me electric cars available in Yangon",
    answer="Here are 3 electric vehicles available in Yangon: Tesla Model 3, BYD Atto 3, and Nissan Leaf. All are available this weekend.",
)

# Scenario 4: Error message — lạc đề
run_metrics(
    label="Error message — irrelevant",
    question="Why is my booking payment failing?",
    answer="Please update your app to the latest version for the best experience.",
)

print(f"\n{'='*60}")
print("Summary:")
print("Relevancy  = câu trả lời có đúng chủ đề không?")
print("Faithfulness = có bịa thêm ngoài context không?")
print("Hallucination = có facts sai/bịa không?")
print("='*60")
