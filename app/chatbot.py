import os
import re
import streamlit as st
from dotenv import load_dotenv
from google import genai
import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

# -----------------------
# 1) Trading Strategies
# -----------------------
TRADING_STRATEGIES = [
    {"name": "Value Investing", "risk_level": "low", "description": "Buying undervalued stocks and holding them long-term, believing they will eventually reflect their true value."},
    {"name": "Dividend Investing", "risk_level": "low", "description": "Focusing on companies that consistently pay dividends. Great for income and lower volatility."},
    {"name": "Growth Investing", "risk_level": "moderate", "description": "Investing in companies expected to grow at an above-average rate. Offers potentially higher returns with moderate volatility."},
    {"name": "Swing Trading", "risk_level": "moderate", "description": "Holding positions for days to weeks to capture short-term price swings. Requires technical analysis and active monitoring."},
    {"name": "Momentum Trading", "risk_level": "high", "description": "Buying stocks with upward momentum or shorting those with downward momentum. High reward potential with higher volatility."},
    {"name": "Options Trading (Speculative)", "risk_level": "high", "description": "Using options to leverage positions. Can amplify gains and losses. Not recommended for beginners."},
]

def parse_risk_level(query: str) -> str:
    match = re.search(r'(low|medium|moderate|high)\s*risk', query, re.IGNORECASE)
    if match:
        level = match.group(1).lower()
        return "moderate" if level == "medium" else level
    return ""

def provide_trading_strategies(risk_level=""):
    strategies = [s for s in TRADING_STRATEGIES if not risk_level or s["risk_level"] == risk_level]
    intro = (f"Here are some {risk_level}-risk strategies:" if risk_level and strategies 
             else ("No exact matches. Showing all strategies:" if risk_level else "Here are several trading strategies:"))
    lines = [intro] + [f"**{s['name']}** (Risk: {s['risk_level'].title()})\n- {s['description']}" for s in strategies]
    return "\n".join(lines)

def parse_chart_period(query: str) -> str:
    match = re.search(r"(\d+)\s*(day|days|month|months|year|years)", query, re.IGNORECASE)
    if match:
        num, unit = match.group(1), match.group(2).lower()
        if "day" in unit:
            return f"{num}d"
        elif "month" in unit:
            return f"{num}mo"
        elif "year" in unit:
            return f"{num}y"
    return "6mo"

def get_stock_data(ticker, period="1mo"):
    try:
        stock = yf.Ticker(ticker)
        return {"info": stock.info, "history": stock.history(period=period), "valid": True}
    except Exception as e:
        return {"valid": False, "error": str(e)}

def generate_stock_summary(ticker):
    data = get_stock_data(ticker)
    if not data["valid"]:
        return f"Error fetching data for {ticker}: {data['error']}"
    info = data["info"]
    try:
        return (
            f"### {info.get('shortName', ticker)} ({ticker})\n"
            f"**Current Price**: ${info.get('currentPrice', 'N/A'):.2f}\n"
            f"**Previous Close**: ${info.get('previousClose', 'N/A'):.2f}\n"
            f"**Market Cap**: ${info.get('marketCap', 0)/1e9:.2f}B\n"
            f"**52-Week Range**: ${info.get('fiftyTwoWeekLow', 'N/A'):.2f} - ${info.get('fiftyTwoWeekHigh', 'N/A'):.2f}\n"
            f"**P/E Ratio**: {info.get('trailingPE', 'N/A'):.2f}\n"
            f"**Dividend Yield**: {info.get('dividendYield', 0):.2f}%\n"
            f"**Business Summary**: {info.get('longBusinessSummary', 'No summary available')}"
        )
    except Exception:
        return "Invalid Ticker"

def plot_stock_chart(ticker, period="6mo"):
    data = get_stock_data(ticker, period)
    if not data["valid"]:
        return None
    hist = data["history"]
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(hist.index, hist['Close'])
    ax.set(title=f"{ticker} Stock Price - {period}", xlabel="Date", ylabel="Price ($)")
    ax.grid(True)
    return fig

def analyze_trend(ticker, days=30):
    data = get_stock_data(ticker, period=f"{days}d")
    if not data["valid"] or len(data["history"]) < 2:
        return f"Not enough data to analyze trend for {ticker}."
    hist = data["history"]
    change = ((hist['Close'].iloc[-1] - hist['Close'].iloc[0]) / hist['Close'].iloc[0]) * 100
    trend = "strongly bullish" if change > 5 else "mildly bullish" if change > 0 else "mildly bearish" if change > -5 else "strongly bearish"
    return f"{days}-day trend for {ticker}: {trend} ({change:.2f}%)."

def get_stock_recommendation_key(ticker):
    data = get_stock_data(ticker)
    if not data["valid"]:
        return None, f"Error fetching recommendation for {ticker}: {data['error']}"
    return data["info"].get("recommendationKey", "No recommendationKey available"), None

def process_query(query):
    query_lower = query.lower()
    ticker_match = re.search(r'\$([A-Za-z]+)|\bticker:([A-Za-z]+)\b', query)

    if "strategy" in query_lower:
        risk = parse_risk_level(query)
        summary_info = generate_stock_summary(ticker) if ticker_match else ""
        return provide_trading_strategies(risk), f"strategy_suggestions\n{summary_info}"

    summary_info = ''
    additional_info = ""
    if ticker_match:
        ticker = (ticker_match.group(1) or ticker_match.group(2)).upper()

        summary_info += generate_stock_summary(ticker)
        if "recommend" in query_lower or "rating" in query_lower:
            rec_key, error = get_stock_recommendation_key(ticker)
            if error:
                return error, "recommendation_displayed"
            prompt = (
                f"You are a finance expert. We have retrieved the following information from Yahoo Finance for {ticker}:\n"
                f"{summary_info}\n\n"
                f"The raw Yahoo Finance recommendation for {ticker} is '{rec_key}'.\n"
                "Please provide a concise justification for this recommendation, including potential reasons "
                "such as fundamentals and market sentiment. Also, remind the user that this is for informational "
                "purposes only and not financial advice."
            )
            return prompt, "recommendation_justification"

        if "chart" in query_lower or "graph" in query_lower:
            period = parse_chart_period(query)
            st.subheader(f"{ticker} Stock Chart ({period})")
            chart = plot_stock_chart(ticker, period)
            if chart:
                st.pyplot(chart)
            return f"Generated chart for {ticker} over {period}.", "chart_displayed"

        if "trend" in query_lower or "analysis" in query_lower:
            additional_info += "\n" + analyze_trend(ticker) + "\n" + summary_info

        summary = generate_stock_summary(ticker)
        additional_info += "\n" + summary

    fallback = (
        f"You are a finance expert assistant. Answer the query: {query}\n"
        f"{additional_info}\n"
        "Note: This is for informational purposes only and not financial advice."
    )
    return fallback, additional_info

# -----------------------
# Main Streamlit App
# -----------------------
st.title("Finance Chatbot")
st.markdown("""
Ask about:
- Stock prices, charts, or trends
- Company info and Analysis
- Trading strategies (e.g., "Show me some low-risk strategies") for Companies
- Stock recommendations (e.g., "What's the recommendation for $AAPL?")
- General finance queries

Keywords
- "summary" or "info" for company information | $TICKER required for stock-specific info
- "price" for stock prices | $TICKER required for stock-specific prices
- "chart" or "graph" for stock charts | $TICKER required for stock-specific charts
- "trend" or "analysis" for trend analysis | $TICKER required for stock-specific analysis
- "recommendation" or "rating" for stock recommendations | $TICKER required for stock-specific recommendations
- "strategy" for trading strategies | "low", "moderate", or "high" risk levels available | $TICKER optional for stock-specific strategies

Examples:
- "$AAPL chart for 3 months"
- "Tell me about $TSLA and $TSLA Price"
- "What are some moderate risk strategies? for $AAPL"
- "What's the recommendation for $TSLA?"
""")

if "messages" not in st.session_state:
    st.session_state.messages = []

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

user_input = st.chat_input("Ask about stocks, strategies, or recommendations!")
if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    load_dotenv()
    API_KEY = os.getenv("GEMINI_API_KEY")
    if not API_KEY:
        bot_reply = "⚠️ API Key is missing. Please set up your GEMINI_API_KEY in the .env file."
    else:
        prompt, tag = process_query(user_input)
        if tag in ("chart_displayed", "strategy_suggestions"):
            bot_reply = prompt
        else:
            try:
                client = genai.Client(api_key=API_KEY)
                response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
                bot_reply = response.text
            except Exception as e:
                bot_reply = f"⚠️ Error fetching response: {e}"
    st.session_state.messages.append({"role": "assistant", "content": bot_reply})
    with st.chat_message("assistant"):
        st.markdown(bot_reply)

with st.sidebar:
    st.header("About Finance Chatbot")
    st.markdown("""
    This chatbot provides:
    - Real-time stock data via yfinance
    - Customizable chart periods (e.g., 3 days, 2 months)
    - Company info and trend analysis
    - Trading strategy recommendations by risk level
    - Yahoo Finance recommendations with LLM justification
    """)
    st.header("Popular Stocks")
    for ticker in ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]:
        if st.button(ticker):
            st.session_state.messages.append({"role": "user", "content": f"Tell me about ${ticker}"})
            st.rerun()
