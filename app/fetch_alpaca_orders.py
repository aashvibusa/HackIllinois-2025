# import os
# from datetime import datetime, timedelta
# from dotenv import load_dotenv
# from alpaca.data.historical import CryptoHistoricalDataClient

# # No keys required for crypto data
# client = CryptoHistoricalDataClient()

# # Load environment variables from .env file
# load_dotenv()

# # Get API credentials from environment variables
# API_KEY = os.getenv("ALPACA_API_KEY")
# API_SECRET = os.getenv("ALPACA_API_SECRET")
# BASE_URL = os.getenv("ALPACA_API_BASE_URL", "https://paper-api.alpaca.markets")

import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import pandas as pd
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import GetOrdersRequest

# Load environment variables from .env file
load_dotenv()

# Get API credentials from environment variables
API_KEY = os.getenv("ALPACA_API_KEY")
API_SECRET = os.getenv("ALPACA_API_SECRET")
BASE_URL = os.getenv("ALPACA_API_BASE_URL", "https://paper-api.alpaca.markets")

# Initialize Trading client
trading_client = TradingClient(API_KEY, API_SECRET, paper=True)

# Create a request to get recent orders
# By default, this gets open orders
request_params = GetOrdersRequest(
    status="all",       # Get all orders (open, closed, etc.)
    limit=50,           # Limit to 50 most recent orders
    direction="desc"    # Most recent first
)

# Get the orders
orders = trading_client.get_orders(request_params)

# Print order information
print(f"Found {len(orders)} recent orders:")
for order in orders:
    print(f"Order ID: {order.id}")
    print(f"Symbol: {order.symbol}")
    print(f"Side: {order.side}")
    print(f"Type: {order.type}")
    print(f"Qty: {order.qty}")
    print(f"Status: {order.status}")
    print(f"Created at: {order.created_at}")
    print("-" * 50)

# Optional: Convert to DataFrame for easier analysis
if orders:
    # Extract relevant fields from each order
    orders_data = [{
        'id': order.id,
        'client_order_id': order.client_order_id,
        'symbol': order.symbol,
        'side': order.side,
        'qty': order.qty,
        'filled_qty': order.filled_qty,
        'type': order.type,
        'status': order.status,
        'created_at': order.created_at,
        'submitted_at': order.submitted_at,
        'filled_at': order.filled_at
    } for order in orders]
    
    # Create DataFrame
    orders_df = pd.DataFrame(orders_data)
    print("\nOrders DataFrame:")
    print(orders_df)
    # Save to CSV
    orders_df.to_csv('orders.csv', index=False)
