import streamlit as st
from openai import OpenAI

# Initialize the OpenAI client with OpenRouter API details
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",  # Your API key
)

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

    # Set up headers and body parameters for OpenRouter API call
    extra_headers = {
        "HTTP-Referer": "<YOUR_SITE_URL>",  # Optional. Replace with your site URL for leaderboard rankings.
        "X-Title": "<YOUR_SITE_NAME>",  # Optional. Replace with your site name for leaderboard rankings.
    }
    extra_body = {}  # Add any additional body parameters if needed

    # Prepare the OpenAI client to make the request
    try:
        # Ensure the API key is set properly
        if client.api_key is None or client.api_key == "":
            raise ValueError("API key is missing or invalid.")

        # Make the request to OpenRouter
        completion = client.chat.completions.create(
            extra_headers=extra_headers,
            extra_body=extra_body,
            model="deepseek/deepseek-r1:free",
            messages=st.session_state.messages
        )
        
        # Extract and display the response
        bot_reply = completion.choices[0].message.content
    except Exception as e:
        bot_reply = f"⚠️ Error fetching response: {e}"

    # Store and display the response from the bot
    st.session_state.messages.append({"role": "assistant", "content": bot_reply})
    with st.chat_message("assistant"):
        st.markdown(bot_reply)
