from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

llm = ChatAnthropic(model="claude-haiku-4-5-20251001", temperature=0)

# ── CONCEPT: Self-Healing Locator ────────────────────────
# Khi locator cũ fail, thay vì crash → tự suggest locator mới
# Dựa trên: tên element, role, text content, DOM context

heal_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a Playwright test self-healing engine.
A locator failed. Given the failed locator and the current page DOM snapshot,
suggest the 3 best alternative locators in order of preference.

Rules:
- Prefer: getByRole > getByLabel > getByTestId > getByText > CSS
- Never suggest input[type=...] or generic class selectors
- Each locator must be valid Playwright syntax

Format:
REASON: <why original failed>
LOCATOR_1: <best alternative>
LOCATOR_2: <second choice>
LOCATOR_3: <fallback>"""),
    ("human", """Failed locator: {failed_locator}

Current DOM snapshot:
{dom_snapshot}""")
])

heal_chain = heal_prompt | llm

def self_heal(failed_locator, dom_snapshot):
    result = heal_chain.invoke({
        "failed_locator": failed_locator,
        "dom_snapshot": dom_snapshot
    })
    lines = result.content.strip().split("\n")
    parsed = {}
    for line in lines:
        if ":" in line:
            key, val = line.split(":", 1)
            parsed[key.strip()] = val.strip()
    return parsed

# ── SCENARIO 1: Dev đổi CSS class ────────────────────────
print("=" * 60)
print("Self-Healing Locator Demo — Yoma Car Share")
print("=" * 60)

print("\n📍 Scenario 1: Dev đổi class name")
print("   Old: .car-booking-btn → New: .vehicle-reserve-btn")
result = self_heal(
    failed_locator='.car-booking-btn',
    dom_snapshot="""
<div class="vehicle-card" data-testid="car-card-001">
  <h3 class="vehicle-name">Toyota Camry</h3>
  <span class="price-tag">15,000 MMK/day</span>
  <button class="vehicle-reserve-btn" 
          aria-label="Book Toyota Camry"
          data-testid="book-btn">
    Book Now
  </button>
</div>"""
)
for k, v in result.items():
    print(f"  {k}: {v}")

# ── SCENARIO 2: Dev restructure HTML ──────────────────────
print("\n📍 Scenario 2: Input field bị wrap thêm div")
print("   Old: input[name='email'] → cấu trúc HTML thay đổi")
result = self_heal(
    failed_locator="input[name='email']",
    dom_snapshot="""
<div class="form-group">
  <div class="input-wrapper" id="email-field">
    <label for="user-email">Email Address</label>
    <div class="input-container">
      <input 
        id="user-email"
        type="email"
        placeholder="Enter your email"
        aria-label="Email Address"
        data-testid="email-input"
        autocomplete="email"
      />
    </div>
  </div>
</div>"""
)
for k, v in result.items():
    print(f"  {k}: {v}")

# ── SCENARIO 3: Button text thay đổi ─────────────────────
print("\n📍 Scenario 3: Button text đổi từ 'Login' → 'Sign In'")
result = self_heal(
    failed_locator="button:has-text('Login')",
    dom_snapshot="""
<div class="auth-container">
  <form class="sign-in-form" data-testid="login-form">
    <button 
      type="submit"
      class="auth-btn primary"
      data-testid="submit-auth"
      aria-label="Sign in to your account">
      Sign In
    </button>
    <a href="/register" class="register-link">Create account</a>
  </form>
</div>"""
)
for k, v in result.items():
    print(f"  {k}: {v}")

print("\n" + "=" * 60)
print("Key insight:")
print("Thay vì test CRASH khi UI thay đổi →")
print("AI suggest 3 locators tốt hơn theo priority")
print("getByRole > getByLabel > getByTestId > CSS")
print("=" * 60)
