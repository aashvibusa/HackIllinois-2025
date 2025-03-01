from flask import Flask, jsonify
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

trading_client = TradingClient(API_KEY, API_SECRET, paper=True)

app = Flask(__name__)

def fetch_alpaca_orders():
    # Create a request to get recent orders
    request_params = GetOrdersRequest(
        status="all",       # Get all orders (open, closed, etc.)
        limit=50,           # Limit to 50 most recent orders
        direction="desc"    # Most recent first
    )

    # Get the orders
    orders = trading_client.get_orders(request_params)

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

    return orders_data

@app.route('/orders', methods=['GET'])
def get_orders():
    orders = fetch_alpaca_orders()
    return jsonify(orders)

if __name__ == '__main__':
    app.run(debug=True)