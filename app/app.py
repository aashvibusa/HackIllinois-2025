from flask import Flask, jsonify, request, abort
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

def place_order(
    trading_client,
    symbol,
    side,
    qty=None,
    notional=None,
    order_type="market",
    time_in_force="day",
    limit_price=None,
    stop_price=None,
    trail_percent=None,
    trail_price=None,
    extended_hours=False,
    client_order_id=None,
    order_class="simple",
    take_profit=None,
    stop_loss=None
):
    """
    Place an order with Alpaca.
    
    Parameters:
    -----------
    trading_client : TradingClient
        Initialized Alpaca trading client
    symbol : str
        Stock symbol
    side : str
        'buy' or 'sell'
    qty : float, optional
        Quantity of shares (use either qty or notional, not both)
    notional : float, optional
        Dollar amount to trade (use either qty or notional, not both)
    order_type : str, default 'market'
        'market', 'limit', 'stop', 'stop_limit', or 'trailing_stop'
    time_in_force : str, default 'day'
        'day', 'gtc', 'opg', 'cls', 'ioc', or 'fok'
    limit_price : float, optional
        Required for limit and stop_limit orders
    stop_price : float, optional
        Required for stop and stop_limit orders
    trail_percent : float, optional
        Trailing percent for trailing_stop orders
    trail_price : float, optional
        Trailing price for trailing_stop orders
    extended_hours : bool, default False
        Whether the order can be executed during extended hours
    client_order_id : str, optional
        Client-provided ID for the order
    order_class : str, default 'simple'
        'simple', 'bracket', 'oco', or 'oto'
    take_profit : dict, optional
        Take profit details for bracket orders, e.g., {'limit_price': 200.0}
    stop_loss : dict, optional
        Stop loss details for bracket orders, e.g., {'stop_price': 150.0, 'limit_price': 145.0}
        
    Returns:
    --------
    order : Order
        The submitted order object
    """
    from alpaca.trading.requests import (
        MarketOrderRequest, 
        LimitOrderRequest, 
        StopOrderRequest, 
        StopLimitOrderRequest,
        TrailingStopOrderRequest
    )
    
    # Validate input parameters
    if qty is None and notional is None:
        raise ValueError("Either qty or notional must be provided")
    if qty is not None and notional is not None:
        raise ValueError("Only one of qty or notional should be provided")
    
    # Prepare order parameters
    order_params = {
        "symbol": symbol,
        "side": side,
        "time_in_force": time_in_force,
        "extended_hours": extended_hours
    }
    
    # Add either quantity or notional value
    if qty is not None:
        order_params["qty"] = qty
    else:
        order_params["notional"] = notional
    
    # Add client order ID if provided
    if client_order_id:
        order_params["client_order_id"] = client_order_id
    
    # Add order class and related parameters if not simple
    if order_class != "simple":
        order_params["order_class"] = order_class
        if take_profit:
            order_params["take_profit"] = take_profit
        if stop_loss:
            order_params["stop_loss"] = stop_loss
    
    # Create appropriate order request based on order type
    if order_type == "market":
        order_request = MarketOrderRequest(**order_params)
    
    elif order_type == "limit":
        if limit_price is None:
            raise ValueError("limit_price is required for limit orders")
        order_params["limit_price"] = limit_price
        order_request = LimitOrderRequest(**order_params)
    
    elif order_type == "stop":
        if stop_price is None:
            raise ValueError("stop_price is required for stop orders")
        order_params["stop_price"] = stop_price
        order_request = StopOrderRequest(**order_params)
    
    elif order_type == "stop_limit":
        if stop_price is None or limit_price is None:
            raise ValueError("Both stop_price and limit_price are required for stop_limit orders")
        order_params["stop_price"] = stop_price
        order_params["limit_price"] = limit_price
        order_request = StopLimitOrderRequest(**order_params)
    
    elif order_type == "trailing_stop":
        if trail_percent is None and trail_price is None:
            raise ValueError("Either trail_percent or trail_price is required for trailing_stop orders")
        if trail_percent is not None:
            order_params["trail_percent"] = trail_percent
        if trail_price is not None:
            order_params["trail_price"] = trail_price
        order_request = TrailingStopOrderRequest(**order_params)
    
    else:
        raise ValueError(f"Unsupported order type: {order_type}")
    
    # Submit the order
    try:
        order = trading_client.submit_order(order_request)
        print(f"Order placed: {order.id} - {symbol} {side} {order_type}")
        return order
    except Exception as e:
        print(f"Error placing order: {e}")
        raise


@app.route('/orders', methods=['GET'])
def get_orders():
    orders = fetch_alpaca_orders()
    return jsonify(orders)


@app.route('/place_order', methods=['POST'])
def create_order():
    """
    API endpoint to place an order.
    
    Example POST request body:
    {
        "symbol": "AAPL",
        "side": "buy",
        "qty": 1,
        "order_type": "market",
        "time_in_force": "day"
    }
    
    For a limit order:
    {
        "symbol": "AAPL",
        "side": "buy",
        "qty": 1,
        "order_type": "limit",
        "limit_price": 150.00,
        "time_in_force": "gtc"
    }
    
    For a bracket order:
    {
        "symbol": "AAPL",
        "side": "buy",
        "qty": 1,
        "order_type": "limit",
        "limit_price": 150.00,
        "time_in_force": "gtc",
        "order_class": "bracket",
        "take_profit": {"limit_price": 160.00},
        "stop_loss": {"stop_price": 140.00}
    }
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    
    # Required parameters
    required_params = ["symbol", "side"]
    for param in required_params:
        if param not in data:
            return jsonify({"error": f"Missing required parameter: {param}"}), 400
    
    # Validate side parameter
    if data["side"] not in ["buy", "sell"]:
        return jsonify({"error": "Side must be 'buy' or 'sell'"}), 400
    
    # Check for quantity or notional
    if "qty" not in data and "notional" not in data:
        return jsonify({"error": "Either 'qty' or 'notional' must be provided"}), 400
    
    # Extract parameters
    symbol = data["symbol"]
    side = data["side"]
    qty = data.get("qty")
    notional = data.get("notional")
    order_type = data.get("order_type", "market")
    time_in_force = data.get("time_in_force", "day")
    limit_price = data.get("limit_price")
    stop_price = data.get("stop_price")
    trail_percent = data.get("trail_percent")
    trail_price = data.get("trail_price")
    extended_hours = data.get("extended_hours", False)
    client_order_id = data.get("client_order_id")
    order_class = data.get("order_class", "simple")
    take_profit = data.get("take_profit")
    stop_loss = data.get("stop_loss")
    
    # Convert qty to float if it exists
    if qty is not None:
        try:
            qty = float(qty)
        except ValueError:
            return jsonify({"error": "Invalid qty value"}), 400
    
    # Convert notional to float if it exists
    if notional is not None:
        try:
            notional = float(notional)
        except ValueError:
            return jsonify({"error": "Invalid notional value"}), 400
    
    # Convert prices to float if they exist
    if limit_price is not None:
        try:
            limit_price = float(limit_price)
        except ValueError:
            return jsonify({"error": "Invalid limit_price value"}), 400
    
    if stop_price is not None:
        try:
            stop_price = float(stop_price)
        except ValueError:
            return jsonify({"error": "Invalid stop_price value"}), 400
    
    if trail_percent is not None:
        try:
            trail_percent = float(trail_percent)
        except ValueError:
            return jsonify({"error": "Invalid trail_percent value"}), 400
    
    if trail_price is not None:
        try:
            trail_price = float(trail_price)
        except ValueError:
            return jsonify({"error": "Invalid trail_price value"}), 400
    
    try:
        order = place_order(
            trading_client=trading_client,
            symbol=symbol,
            side=side,
            qty=qty,
            notional=notional,
            order_type=order_type,
            time_in_force=time_in_force,
            limit_price=limit_price,
            stop_price=stop_price,
            trail_percent=trail_percent,
            trail_price=trail_price,
            extended_hours=extended_hours,
            client_order_id=client_order_id,
            order_class=order_class,
            take_profit=take_profit,
            stop_loss=stop_loss
        )
        
        # Convert order object to dictionary
        order_data = {
            'id': order.id,
            'client_order_id': order.client_order_id,
            'symbol': order.symbol,
            'side': order.side,
            'qty': order.qty,
            'type': order.type,
            'status': order.status,
            'created_at': order.created_at,
            'submitted_at': order.submitted_at
        }
        
        return jsonify({"message": "Order placed successfully", "order": order_data}), 201
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to place order: {str(e)}"}), 500


@app.route('/account', methods=['GET'])
def get_account():
    """Get account information"""
    try:
        account = trading_client.get_account()
        account_data = {
            'id': account.id,
            'cash': account.cash,
            'buying_power': account.buying_power,
            'equity': account.equity,
            'portfolio_value': account.portfolio_value,
            'status': account.status,
            'currency': account.currency,
            'pattern_day_trader': account.pattern_day_trader,
            'trading_blocked': account.trading_blocked,
            'account_blocked': account.account_blocked,
            'created_at': account.created_at
        }
        return jsonify(account_data)
    except Exception as e:
        return jsonify({"error": f"Failed to get account: {str(e)}"}), 500


@app.route('/positions', methods=['GET'])
def get_positions():
    """Get all open positions"""
    try:
        positions = trading_client.get_all_positions()
        positions_data = [{
            'symbol': position.symbol,
            'qty': position.qty,
            'market_value': position.market_value,
            'avg_entry_price': position.avg_entry_price,
            'side': position.side,
            'current_price': position.current_price,
            'unrealized_pl': position.unrealized_pl,
            'unrealized_plpc': position.unrealized_plpc,
            'asset_id': position.asset_id
        } for position in positions]
        return jsonify(positions_data)
    except Exception as e:
        return jsonify({"error": f"Failed to get positions: {str(e)}"}), 500


@app.route('/close_position/<symbol>', methods=['DELETE'])
def close_position(symbol):
    """Close a position for a specific symbol"""
    try:
        response = trading_client.close_position(symbol)
        return jsonify({
            "message": f"Position for {symbol} closed successfully",
            "order_id": response.id
        })
    except Exception as e:
        return jsonify({"error": f"Failed to close position: {str(e)}"}), 500


@app.route('/close_all_positions', methods=['DELETE'])
def close_all_positions():
    """Close all open positions"""
    try:
        closed_orders = trading_client.close_all_positions(cancel_orders=True)
        return jsonify({
            "message": "All positions closed successfully",
            "orders": [order.id for order in closed_orders]
        })
    except Exception as e:
        return jsonify({"error": f"Failed to close all positions: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
