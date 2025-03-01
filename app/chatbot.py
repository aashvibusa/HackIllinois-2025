import streamlit as st
import requests

# OpenRouter API Key
API_KEY = "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"
API_URL = "https://openrouter.ai/api/v1"

# Streamlit App Title
st.title("Stock Trading Chatbot")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# User input
user_input = st.chat_input("Ask me about stocks!")

if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    # Call DeepSeek AI via OpenRouter
    headers = {"Authorization": f"Bearer {API_KEY}"}
    payload = {
        "model": "deepseek/deepseek-r1:free",
        "messages": st.session_state.messages
    }

    response = requests.post(API_URL, json=payload, headers=headers)
    
    if response.status_code == 200:
        bot_reply = response.json()["choices"][0]["message"]["content"]
    else:
        bot_reply = "⚠️ Error fetching response from DeepSeek AI."

    # Store and display response
    st.session_state.messages.append({"role": "assistant", "content": bot_reply})
    with st.chat_message("assistant"):
        st.markdown(bot_reply)
