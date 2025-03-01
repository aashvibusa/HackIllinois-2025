from flask import Flask, request, jsonify
import yfinance as yf
import alpaca_trade_api as tradeapi
import os
import pandas as pd
from datetime import datetime, timedelta
import logging
from dateutil import parser
from dotenv import load_dotenv
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Load environment variables
load_dotenv()
print("ALPACA_API_KEY:", os.getenv('ALPACA_API_KEY'))
print("ALPACA_API_SECRET:", os.getenv('ALPACA_API_SECRET'))
print("ALPACA_BASE_URL:", os.getenv('ALPACA_BASE_URL'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Alpaca API credentials
ALPACA_API_KEY = os.getenv('ALPACA_API_KEY')
ALPACA_API_SECRET = os.getenv('ALPACA_API_SECRET')
ALPACA_BASE_URL = os.getenv('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets')  # Default to paper trading

# Initialize Alpaca API
api = tradeapi.REST(ALPACA_API_KEY, ALPACA_API_SECRET, ALPACA_BASE_URL, api_version='v2')

# Popular stock symbols for watchlist
DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ']

# Helper functions
def get_timeframe_params(timeframe):
    """Convert timeframe string to start date and interval parameters for yfinance"""
    end_date = datetime.now()
    
    if timeframe == '1d':
        start_date = end_date - timedelta(days=1)
        interval = '5m'
    elif timeframe == '1w':
        start_date = end_date - timedelta(weeks=1)
        interval = '1h'
    elif timeframe == '1m':
        start_date = end_date - timedelta(days=30)
        interval = '1d'
    elif timeframe == '3m':
        start_date = end_date - timedelta(days=90)
        interval = '1d'
    elif timeframe == '1y':
        start_date = end_date - timedelta(days=365)
        interval = '1d'
    else:
        start_date = end_date - timedelta(days=1)
        interval = '5m'
        
    return start_date, end_date, interval

def format_chart_data(history_df):
    """Format dataframe to chart-friendly format"""
    if history_df.empty:
        return []
        
    # Reset index to make date a column
    history_df = history_df.reset_index()
    
    # Convert timestamps to ISO format strings
    history_df['Datetime'] = history_df['Datetime'].astype(str)
    
    # Format the response
    chart_data = []
    for _, row in history_df.iterrows():
        data_point = {
            'date': row['Datetime'],
            'open': row['Open'],
            'high': row['High'],
            'low': row['Low'],
            'close': row['Close'],
            'volume': row['Volume']
        }
        chart_data.append(data_point)
        
    return chart_data
from flask.json import JSONEncoder
import numpy as np

class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.int64, np.int32, np.int16, np.int8)):
            return int(obj)
        elif isinstance(obj, (np.float64, np.float32, np.float16)):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)

app.json_encoder = CustomJSONEncoder

@app.route('/api/account', methods=['GET'])
def get_account():
    """Get Alpaca account information"""
    print("bruh")
    try:
        account = api.get_account()
        
        return jsonify({
            'cash': float(account.cash),
            'portfolioValue': float(account.portfolio_value),
            'buyingPower': float(account.buying_power),
            'equity': float(account.equity),
            'daytradeCount': int(account.daytrade_count),
            'initialMargin': float(account.initial_margin),
            'maintenanceMargin': float(account.maintenance_margin),
            'status': account.status
        })
    except Exception as e:
        logger.error(f"Error getting account: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/market/overview', methods=['GET'])
def get_market_overview():
    try:
        # Major market indices
        indices = {
            'S&P 500': '^GSPC',
            'Dow Jones': '^DJI',
            'NASDAQ': '^IXIC',
            'Russell 2000': '^RUT'
        }
        
        result = {}
        
        for name, symbol in indices.items():
            ticker = yf.Ticker(symbol)
            data = ticker.history(period='1d')

            if not data.empty:
                last_row = data.iloc[-1]
                prev_close = data['Close'].iloc[-2] if len(data) > 1 else last_row['Open']
                
                change = last_row['Close'] - prev_close
                change_percent = (change / prev_close) * 100
                
                result[name] = {
                    'symbol': symbol,
                    'price': last_row['Close'],
                    'change': change,
                    'changePercent': change_percent,
                    'high': last_row['High'],
                    'low': last_row['Low'],
                    'volume': last_row['Volume']
                }
        
        # Get market status from Alpaca
        clock = api.get_clock()
        
        return jsonify({
            'indices': result,
            'marketStatus': {
                'isOpen': clock.is_open,
                'nextOpen': clock.next_open.isoformat(),
                'nextClose': clock.next_close.isoformat()
            }
        })
    except Exception as e:
        logger.error(f"Error getting market overview: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/market/watchlist', methods=['GET'])
def get_watchlist():
    try:
        result = []
        for symbol in DEFAULT_WATCHLIST:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = ticker.history(period='2d')
                
                if not hist.empty and len(hist) > 1:
                    last_close = float(hist['Close'].iloc[-1])  # Convert to float
                    prev_close = float(hist['Close'].iloc[-2])  # Convert to float
                    change = float(last_close - prev_close)     # Convert to float
                    change_percent = float((change / prev_close) * 100)  # Convert to float
                    
                    stock_data = {
                        'symbol': symbol,
                        'name': info.get('shortName', symbol),
                        'price': last_close,
                        'change': change,
                        'changePercent': change_percent,
                        'volume': int(hist['Volume'].iloc[-1])  # Convert to int
                    }
                    result.append(stock_data)
            except Exception as stock_error:
                logger.error(f"Error getting data for {symbol}: {str(stock_error)}")
                continue
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting watchlist: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stocks/<symbol>', methods=['GET'])
def get_stock_data(symbol):
    try:
        ticker = yf.Ticker(symbol)
        print(symbol)
        # Get company info
        info = ticker.info
        
        # Get recent quote data
        hist = ticker.history(period='5d')
        
        if hist.empty:
            return jsonify({'error': 'No data available for this symbol'}), 404
            
        last_day = hist.iloc[-1]
        prev_day = hist.iloc[-2] if len(hist) > 1 else hist.iloc[0]
        
        # Calculate change
        change = last_day['Close'] - prev_day['Close']
        change_percent = (change / prev_day['Close']) * 100
        
        # Format response
        result = {
            'symbol': symbol,
            'name': info.get('shortName', symbol),
            'quote': {
                'c': last_day['Close'],  # current price
                'h': last_day['High'],   # high price
                'l': last_day['Low'],    # low price
                'o': last_day['Open'],   # open price
                'pc': prev_day['Close'], # previous close
                'v': last_day['Volume'], # volume
                'change': change,
                'changePercent': change_percent
            },
            'company': {
                'industry': info.get('industry', ''),
                'sector': info.get('sector', ''),
                'marketCap': info.get('marketCap', 0),
                'employees': info.get('fullTimeEmployees', 0)
            },
            'stats': {
                'pe': info.get('trailingPE', 0),
                'forwardPE': info.get('forwardPE', 0),
                'eps': info.get('trailingEps', 0),
                'dividendYield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
                'beta': info.get('beta', 0),
                '52weekHigh': info.get('fiftyTwoWeekHigh', 0),
                '52weekLow': info.get('fiftyTwoWeekLow', 0),
                'avgVolume': info.get('averageVolume', 0),
                'recommendation': info.get('recommendationKey', 'N/A')
            }
        }
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting stock data for {symbol}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stocks/<symbol>/chart', methods=['GET'])
def get_stock_chart_data(symbol):
    try:
        timeframe = request.args.get('timeframe', '1d')
        
        start_date, end_date, interval = get_timeframe_params(timeframe)
        
        # Get historical data from yfinance
        ticker = yf.Ticker(symbol)
        history = ticker.history(start=start_date, end=end_date, interval=interval)
        
        # Rename columns and prepare for JSON response
        history.columns = ['Open', 'High', 'Low', 'Close', 'Volume', 'Dividends', 'Stock Splits']
        history.index.name = 'Datetime'
        
        # Format the data for the chart
        chart_data = format_chart_data(history)
        
        return jsonify(chart_data)
    except Exception as e:
        logger.error(f"Error getting chart data for {symbol}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/positions', methods=['GET'])
def get_positions():
    """Get current positions from Alpaca"""
    try:
        positions = api.list_positions()
        
        result = []
        for position in positions:
            # Get additional data from yfinance for UI enhancement
            try:
                ticker = yf.Ticker(position.symbol)
                info = ticker.info
                name = info.get('shortName', position.symbol)
            except:
                name = position.symbol
            
            position_data = {
                'symbol': position.symbol,
                'name': name,
                'qty': float(position.qty),
                'avgEntryPrice': float(position.avg_entry_price),
                'marketValue': float(position.market_value),
                'costBasis': float(position.cost_basis),
                'unrealizedPL': float(position.unrealized_pl),
                'unrealizedPLPercent': float(position.unrealized_plpc) * 100,
                'currentPrice': float(position.current_price),
                'changeToday': float(position.change_today) * 100,
                'side': position.side
            }
            result.append(position_data)
            
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting positions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/positions/<symbol>', methods=['DELETE'])
def close_position(symbol):
    try:
        # Close the position using Alpaca API
        api.close_position(symbol)
        return jsonify({'success': True, 'message': f'Position for {symbol} closed successfully'})
    except Exception as e:
        logger.error(f"Error closing position for {symbol}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/positions', methods=['DELETE'])
def close_all_positions():
    try:
        # Close all positions using Alpaca API
        api.close_all_positions()
        return jsonify({'success': True, 'message': 'All positions closed successfully'})
    except Exception as e:
        logger.error(f"Error closing all positions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/portfolio/summary', methods=['GET'])
def get_portfolio_summary():
    """Get portfolio summary from Alpaca"""
    try:
        account = api.get_account()
        positions = api.list_positions()
        
        # Calculate daily change
        current_value = float(account.portfolio_value)
        equity_prev_close = float(account.equity) - float(account.equity_change)
        day_change = (float(account.equity_change) / equity_prev_close) * 100 if equity_prev_close else 0
        
        # Calculate total P/L
        total_pl = 0
        total_cost_basis = 0
        
        for position in positions:
            total_pl += float(position.unrealized_pl)
            total_cost_basis += float(position.cost_basis)
        
        total_pl_percent = (total_pl / total_cost_basis) * 100 if total_cost_basis else 0
        
        return jsonify({
            'portfolioValue': current_value,
            'cashBalance': float(account.cash),
            'dayChange': day_change,
            'dayChangeValue': float(account.equity_change),
            'totalPnL': total_pl,
            'totalPnLPercent': total_pl_percent,
            'buyingPower': float(account.buying_power)
        })
    except Exception as e:
        logger.error(f"Error getting portfolio summary: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/portfolio/history', methods=['GET'])
def get_portfolio_history():
    """Get historical portfolio performance"""
    try:
        timeframe = request.args.get('timeframe', '3m')
        
        # Calculate date ranges based on timeframe
        end_date = datetime.now()
        
        if timeframe == '1d':
            start_date = end_date - timedelta(days=1)
            timeframe = '1Min'
        elif timeframe == '1w':
            start_date = end_date - timedelta(weeks=1)
            timeframe = '15Min'
        elif timeframe == '1m':
            start_date = end_date - timedelta(days=30)
            timeframe = '1D'
        elif timeframe == '3m':
            start_date = end_date - timedelta(days=90)
            timeframe = '1D'
        elif timeframe == '1y':
            start_date = end_date - timedelta(days=365)
            timeframe = '1D'
        else:
            start_date = end_date - timedelta(days=90)
            timeframe = '1D'
        
        # Format dates for Alpaca API
        start_str = start_date.strftime('%Y-%m-%d')
        end_str = end_date.strftime('%Y-%m-%d')
        
        # Get portfolio history from Alpaca
        portfolio_history = api.get_portfolio_history(
            period=timeframe,
            timeframe=timeframe,
            date_start=start_str,
            date_end=end_str,
            extended_hours=True
        )
        
        # Format the response
        result = []
        
        for i in range(len(portfolio_history.timestamp)):
            timestamp = datetime.fromtimestamp(portfolio_history.timestamp[i])
            equity = portfolio_history.equity[i] if portfolio_history.equity and i < len(portfolio_history.equity) else None
            profit_loss = portfolio_history.profit_loss[i] if portfolio_history.profit_loss and i < len(portfolio_history.profit_loss) else None
            profit_loss_pct = portfolio_history.profit_loss_pct[i] if portfolio_history.profit_loss_pct and i < len(portfolio_history.profit_loss_pct) else None
            
            if equity is not None:
                data_point = {
                    'date': timestamp.isoformat(),
                    'value': equity,
                    'profitLoss': profit_loss,
                    'profitLossPct': profit_loss_pct
                }
                result.append(data_point)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting portfolio history: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['GET'])
def get_orders():
    try:
        status = request.args.get('status', 'all')
        
        # Define status filter
        if status == 'open':
            status = 'open'
        elif status == 'closed':
            status = 'closed'
        else:
            status = None
        
        # Get orders from Alpaca
        orders = api.list_orders(status=status, limit=100, nested=True)
        
        result = []
        for order in orders:
            # Format datetime strings
            submitted_at = parser.parse(order.submitted_at) if order.submitted_at else None
            created_at = parser.parse(order.created_at) if order.created_at else None
            updated_at = parser.parse(order.updated_at) if order.updated_at else None
            filled_at = parser.parse(order.filled_at) if order.filled_at else None
            
            order_data = {
                'id': order.id,
                'symbol': order.symbol,
                'qty': float(order.qty) if order.qty else 0,
                'filled_qty': float(order.filled_qty) if order.filled_qty else 0,
                'side': order.side,
                'type': order.type,
                'time_in_force': order.time_in_force,
                'status': order.status,
                'limit_price': float(order.limit_price) if order.limit_price else None,
                'stop_price': float(order.stop_price) if order.stop_price else None,
                'submitted_at': submitted_at.isoformat() if submitted_at else None,
                'created_at': created_at.isoformat() if created_at else None,
                'updated_at': updated_at.isoformat() if updated_at else None,
                'filled_at': filled_at.isoformat() if filled_at else None,
                'filled_avg_price': float(order.filled_avg_price) if order.filled_avg_price else None,
                'order_class': order.order_class
            }
            result.append(order_data)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting orders: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/<order_id>', methods=['DELETE'])
def cancel_order(order_id):
    """Cancel an open order"""
    try:
        api.cancel_order(order_id)
        return jsonify({'success': True, 'message': 'Order canceled successfully'})
    except Exception as e:
        logger.error(f"Error canceling order {order_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['POST'])
def place_order():
    try:
        data = request.json
        
        symbol = data.get('symbol')
        qty = data.get('qty')
        notional = data.get('notional')
        side = data.get('side')
        type = data.get('type', 'market')
        time_in_force = data.get('timeInForce', 'day')
        limit_price = data.get('limitPrice')
        stop_price = data.get('stopPrice')
        
        # Validate required parameters
        if not all([symbol, side]):
            return jsonify({'error': 'Missing required parameters'}), 400
        
        # Convert notional to qty if notional is provided
        if notional:
            ticker = yf.Ticker(symbol)
            current_price = ticker.history(period='1d')['Close'].iloc[-1]
            qty = notional / current_price
        
        # Place order via Alpaca
        order = api.submit_order(
            symbol=symbol,
            qty=qty,
            side=side,
            type=type,
            time_in_force=time_in_force,
            limit_price=limit_price,
            stop_price=stop_price
        )
        
        # Format response
        order_data = {
            'id': order.id,
            'symbol': order.symbol,
            'qty': float(order.qty),
            'side': order.side,
            'type': order.type,
            'timeInForce': order.time_in_force,
            'status': order.status,
            'createdAt': parser.parse(order.created_at).isoformat() if order.created_at else None,
        }
        
        return jsonify(order_data), 201
    except Exception as e:
        logger.error(f"Error placing order: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Create a .env file with FLASK_ENV=development for development
    app.run(debug=os.getenv('FLASK_ENV') == 'development', host='0.0.0.0', port=5001)