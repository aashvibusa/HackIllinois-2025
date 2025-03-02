import pandas as pd
import pickle
from sklearn.metrics.pairwise import cosine_similarity

def prepare_trade_matrix(trades_df):
    trade_matrix = trades_df.pivot_table(index='user_id', columns='symbol', values='quantity', aggfunc='sum', fill_value=0)
    return trade_matrix

def compute_user_similarity(trade_matrix):
    user_similarity = cosine_similarity(trade_matrix)
    user_similarity_df = pd.DataFrame(user_similarity, index=trade_matrix.index, columns=trade_matrix.index)
    return user_similarity_df

def recommend_stocks_for_user(user_id, user_similarity_df, trades_df, top_n=5):
    similar_users = user_similarity_df[user_id].sort_values(ascending=False).iloc[1:]
    most_similar_users = similar_users.head(10).index
    similar_user_trades = trades_df[trades_df['user_id'].isin(most_similar_users)]
    stock_recommendations = similar_user_trades.groupby('symbol')['quantity'].sum().sort_values(ascending=False)
    return stock_recommendations.head(top_n).index.tolist()

def create_sample_user(user_id, trades_input, trades_df):
    sample_user_df = pd.DataFrame(trades_input)
    sample_user_df['user_id'] = user_id
    trades_df = pd.concat([trades_df, sample_user_df], ignore_index=True)
    trade_matrix = prepare_trade_matrix(trades_df)
    user_similarity_df = compute_user_similarity(trade_matrix)
    return trades_df, trade_matrix, user_similarity_df

def save_model(user_similarity_df, trade_matrix, trades_df, filename='model.pkl'):
    with open(filename, 'wb') as file:
        pickle.dump({'user_similarity': user_similarity_df, 'trade_matrix': trade_matrix, 'trades_df': trades_df}, file)

def load_model(filename='model.pkl'):
    with open(filename, 'rb') as file:
        return pickle.load(file)

# Load the stored model
loaded_model = load_model()
trades_df = loaded_model['trades_df']
user_similarity_df = loaded_model['user_similarity']

# Sample user trades
user_id = 'sample_user_4'
trades_input = [
    {'symbol': 'XOM', 'trade_date': '2025-02-01', 'price': 105.30, 'quantity': 10, 'trade_type': 'buy'},
    {'symbol': 'CVX', 'trade_date': '2025-02-05', 'price': 165.70, 'quantity': 15, 'trade_type': 'buy'},
    {'symbol': 'COP', 'trade_date': '2025-02-10', 'price': 80.90, 'quantity': 20, 'trade_type': 'buy'},
    {'symbol': 'OXY', 'trade_date': '2025-02-12', 'price': 60.45, 'quantity': 25, 'trade_type': 'sell'},
    {'symbol': 'EOG', 'trade_date': '2025-02-18', 'price': 122.60, 'quantity': 12, 'trade_type': 'buy'},
    {'symbol': 'PXD', 'trade_date': '2025-02-22', 'price': 190.90, 'quantity': 10, 'trade_type': 'buy'},
    {'symbol': 'SLB', 'trade_date': '2025-02-26', 'price': 48.25, 'quantity': 30, 'trade_type': 'sell'},
]

# Update trades and similarity matrix with new user data
trades_df, trade_matrix, user_similarity_df = create_sample_user(user_id, trades_input, trades_df)

# Save updated model
save_model(user_similarity_df, trade_matrix, trades_df)

# Get stock recommendations
recommended_stocks = recommend_stocks_for_user(user_id, user_similarity_df, trades_df, top_n=5)
print(f"Recommended stocks for {user_id}: {recommended_stocks}")
