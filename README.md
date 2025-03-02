
## Introduction
The Trading Platform is an AI-powered system that provides users with a seamless experience for trading stocks and other financial instruments. It analyzes user trading patterns and behaviors to provide personalized recommendations and warnings, helping users make more informed trading decisions.

## Inspiration
This project was inspired by the need for a more intelligent trading platform that not only facilitates trades but also provides insights and recommendations based on user behavior. By leveraging the power of AI, we aim to democratize access to advanced trading strategies and insights typically available only to professional traders.

## Functionality

### Core Features
- **Paper Money Trading**: Practice trading with virtual money using Alpaca Markets
- **AI-Powered Recommendations**: Get personalized trading suggestions based on your trading history
- **Real-time Market Data**: Access up-to-date information about stocks and financial instruments
- **Portfolio Management**: Track and manage your investments in one place
- **Order Management**: Place and monitor stock orders easily
- **Congressman Trades Tracking**: Monitor and analyze trading activities of members of Congress

### Architecture
The system consists of two main components:

1. **Trading Platform (Frontend)**: 
   - React-based web application
   - Dashboard for viewing market data and portfolio information
   - Stock details and order placement interface
   - Portfolio visualization and tracking

2. **AI Engine (Backend)**:
   - Python-based analysis system
   - Processes trading history and behavior
   - Generates personalized recommendations
   - Interfaces with the Alpaca API for trade execution

## Running the Application

### Frontend (React Client)
1. Navigate to the client directory:
   ```bash
   cd HackIllinois-2025/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend (Flask API)
1. Navigate to the app directory:
   ```bash
   cd HackIllinois-2025/app
   ```

2. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask application:
   ```bash
   python app.py
   ```

### Financial Assistant (Streamlit App)
1. Run the streamlit application
   ```bash
   streamlit run chatbot.py
   ```

## Tech Stack

### Frontend
- [React](https://reactjs.org/) - UI library
- [React Router](https://reactrouter.com/) - Navigation
- [Chakra UI](https://chakra-ui.com/) - Component library
- [Chart.js](https://www.chartjs.org/) - Data visualization

### Backend
- [Flask](https://flask.palletsprojects.com/) - Python web framework
- [OpenAI API](https://openai.com/) - AI capabilities
- [Alpaca Markets API](https://alpaca.markets/) - Trading platform

### Data Processing
- Python for data analysis and processing
- Machine learning models for pattern recognition

### Infrastructure
- Docker for containerization
- Node.js for package management

## Future Enhancements
- Enhanced AI trading strategies
- Mobile application support
- Social trading features
- Advanced technical analysis tools
- Integration with more financial data sources

## Links
- Paper Trading Platform: [Alpaca Markets](https://app.alpaca.markets/paper/dashboard/overview)






