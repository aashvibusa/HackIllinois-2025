import pandas as pd
import yfinance as yf
import requests
from bs4 import BeautifulSoup
import pickle

# Function to fetch real-time stock data from Yahoo Finance (top trending stocks)
def get_trending_stocks():
    url = "https://finance.yahoo.com/trending-tickers"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all stock symbols in the "Most Active" list (they are in <a> tags with a class 'Fw(b)' for the ticker symbol)
    symbols = []
    for a_tag in soup.find_all('a', {'class': 'Fw(b)'}):
        symbol = a_tag.text
        if symbol.isalpha():  # Ensuring that it's a valid ticker symbol
            symbols.append(symbol)
    
    # Download the data for the top 5 most active stocks
    stock_data = {}
    for stock in symbols[:5]:  # Limiting to top 5 trending stocks
        stock_data[stock] = yf.download(stock, period='1d', interval='1m')
    
    return stock_data

# Function to recommend stocks for a user
def recommend_stocks_for_user(user_id, model, trades_df, top_n=5):
    # Extract user similarity and trade matrix from the model
    user_similarity_df = model['user_similarity']
    trade_matrix = model['trade_matrix']
    
    # Get the most similar users to the target user
    similar_users = user_similarity_df[user_id].sort_values(ascending=False)
    
    # Exclude the target user itself and get top N most similar users
    similar_users = similar_users.iloc[1:top_n+1]

    # Get the stocks and quantities traded by the most similar users
    similar_user_trades = trades_df[trades_df['user_id'].isin(similar_users.index)]

    # Group by stock symbol and sum the quantities traded by similar users
    stock_recommendations = similar_user_trades.groupby('symbol')['quantity'].sum().sort_values(ascending=False)

    # Get the top N stocks with the highest total quantity traded by the most similar users
    top_stocks = stock_recommendations.head(top_n)

    return top_stocks.index.tolist()  # Return the stock symbols

# Function to create a sample user and input trades
def create_sample_user(user_id, trades_input, trades_df):
    # Create a DataFrame for the sample user
    user_data = []
    for trade in trades_input:
        user_data.append({
            'user_id': user_id,
            'symbol': trade['symbol'],
            'trade_date': trade['trade_date'],
            'price': trade['price'],
            'quantity': trade['quantity'],
            'trade_type': trade['trade_type']
        })
    
    # Add the sample user's trades to the original DataFrame
    sample_user_df = pd.DataFrame(user_data)
    trades_df = pd.concat([trades_df, sample_user_df], ignore_index=True)
    
    return trades_df

# Sample trades input (User's trades)
trades_input = [
    {'symbol': 'JPM', 'trade_date': '2025-02-01', 'price': 150.50, 'quantity': 10, 'trade_type': 'buy'},  # JPMorgan Chase & Co.
    {'symbol': 'V', 'trade_date': '2025-02-10', 'price': 230.00, 'quantity': 5, 'trade_type': 'buy'},  # Visa Inc.
    {'symbol': 'DIS', 'trade_date': '2025-02-15', 'price': 190.20, 'quantity': 7, 'trade_type': 'buy'},  # The Walt Disney Company
    {'symbol': 'KO', 'trade_date': '2025-02-20', 'price': 58.80, 'quantity': 15, 'trade_type': 'sell'},  # The Coca-Cola Company
    {'symbol': 'MCD', 'trade_date': '2025-02-25', 'price': 250.15, 'quantity': 8, 'trade_type': 'buy'},  # McDonald's Corporation
]

# Example model.pkl loading (replace with actual model.pkl loading logic)
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

# Create the sample user and add their trades
user_id = 'sample_user'  # ID for the sample user
trades_df = model['trades_df']  # Use the trades_df from the model directly
trades_df = create_sample_user(user_id, trades_input, trades_df)

# Run recommendation model for the sample user
recommended_stocks = recommend_stocks_for_user(user_id, model, trades_df, top_n=5)

# Fetch real-time data for trending stocks
trending_stock_data = get_trending_stocks()

# Display the recommended stocks based on similar users
print(f"Recommended stocks for sample user {user_id}: {recommended_stocks}")

# Display the real-time data for the top trending stocks
for stock, data in trending_stock_data.items():
    print(f"Real-time data for {stock}:")
    print(data.tail())  # Show last available data point
