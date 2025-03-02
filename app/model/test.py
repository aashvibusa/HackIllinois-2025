import yfinance as yf
import time
import requests

def fetch_ticker_info(ticker_symbol):
    try:
        ticker = yf.Ticker(ticker_symbol)
        info = ticker.info
        print(info)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:
            print(f"Rate limit reached for {ticker_symbol}. Retrying in 10 seconds...")
            time.sleep(10)  # Wait before retrying
            return fetch_ticker_info(ticker_symbol)  # Retry
        else:
            print(f"An error occurred: {e}")
            return None

tickers = ['MSFT', 'AAPL', 'GOOG']

for ticker_symbol in tickers:
    info = fetch_ticker_info(ticker_symbol)
    if info:
        print(f"{ticker_symbol} Info: {info}")
