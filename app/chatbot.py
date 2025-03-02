import os
import streamlit as st
from dotenv import load_dotenv  # Add this to load environment variables from .env file
from google import genai

# Load environment variables
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

# Check if the API_KEY is loaded correctly
if not API_KEY:
    st.error("API Key not found! Please check your .env file.")
else:
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

        # Set up the Gemini client
        client = genai.Client(api_key=API_KEY)

        # Call Gemini API to get the response
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",  # Replace with the actual model name if needed
                contents=user_input  # Use the user input as content
            )

            # Extract and display the response from Gemini
            bot_reply = response.text
        except Exception as e:
            bot_reply = f"⚠️ Error fetching response from Gemini: {e}"

        # Store and display the response from the bot
        st.session_state.messages.append({"role": "assistant", "content": bot_reply})
        with st.chat_message("assistant"):
            st.markdown(bot_reply)
