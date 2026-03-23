from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

# Dùng Anthropic thay vì OpenAI
llm = ChatAnthropic(model="claude-haiku-4-5-20251001", temperature=0.2)

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a QA engineer. 
Given a feature description, write ONE Playwright test case in TypeScript.
Use Page Object Model style. Keep it simple and readable."""),
    ("human", "Feature: {feature}")
])

chain = prompt | llm

feature = "User can log in with valid email and password"

result = chain.invoke({"feature": feature})

print("=" * 60)
print("FEATURE:", feature)
print("=" * 60)
print(result.content)
print("=" * 60)
