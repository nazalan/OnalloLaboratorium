//TODO adatok mentése

import React, { Component } from 'react';
import './App.css';

class Forecast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      startDate: '',
      endDate: '',
      forecastDays: '',
      calculating: false,
      counterIndex: 0,
      counting: false,
      moneyEUR: 100,
      moneyHUF: 0,
      amount: 0,
      isEuroToForint: true,
      history: [],
      newsDate: ''
    };
    this.interval = null;
    this.handleExchange = this.handleExchange.bind(this);
    this.toggleExchangeDirection = this.toggleExchangeDirection.bind(this);
  }

  API_URL = "http://localhost:5025/";

  componentDidMount() {
    this.setState({
      startDate: '2005-01-01',
      endDate: '2007-01-01',
      forecastDays: '50',
      newsDate: '2020-10-10',
    });
    this.refreshData();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async refreshData() {
    this.setState({ counterIndex: 0, counting: false });
    fetch(this.API_URL + "api/Forecast/GetData")
      .then(response => response.json())
      .then(_data => {
        this.setState({ data: _data });
      });
  }

  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    let month = (d.getMonth() + 1).toString().padStart(2, '0');
    let day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  handleCalculate = () => {
    const { startDate, endDate, forecastDays } = this.state;
    this.handleReset()
    this.setState({ calculating: true });
    fetch(`${this.API_URL}api/Forecast/Calculate?start_date=${startDate}&end_date=${endDate}&forecast_days=${forecastDays}`)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        this.refreshData();
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        this.setState({ calculating: false });
      });
  }

  handleManualRefresh = () => {
    this.refreshData();
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleStartCounter = () => {
    this.interval = setInterval(() => {
      this.setState(prevState => ({
        counterIndex: (prevState.counterIndex + 1) % prevState.data.length
      }));
    }, 2000);
    this.setState({ counting: true });
  }

  handleStopCounter = () => {
    clearInterval(this.interval);
    this.setState({ counting: false });
  }

  handleReset = () => {
    this.handleStopCounter()
    this.setState({ counting: false, counterIndex: 0, moneyEUR: 100, moneyHUF: 0, history: [] });
    this.componentWillUnmount()
  }

  handleExchange = () => {
    const { data, counterIndex, moneyEUR, moneyHUF, amount, isEuroToForint, history } = this.state;
    let updatedMoneyEUR = moneyEUR;
    let updatedMoneyHUF = moneyHUF;
    let exchangeRate = data[counterIndex].Actual;
    let newHistoryItem = {
      ds: data[counterIndex].ds,
      exchangeRate: exchangeRate,
      amount: Number(amount),
      direction: isEuroToForint ? 'EUR to HUF' : 'HUF to EUR'
    };

    let updatedHistory = [...history, newHistoryItem];

    if (isEuroToForint) {
      updatedMoneyEUR -= amount;
      updatedMoneyHUF += Number(amount) * exchangeRate;
    } else {
      updatedMoneyEUR += Number(amount) / exchangeRate;
      updatedMoneyHUF -= amount;
    }

    this.setState({
      moneyEUR: updatedMoneyEUR,
      moneyHUF: updatedMoneyHUF,
      history: updatedHistory
    });
  }

  toggleExchangeDirection() {
    this.setState(prevState => ({
      isEuroToForint: !prevState.isEuroToForint
    }));
  }

  lastDaysChanges(day) {
    const { data, counterIndex } = this.state;
    let percentage = 0;
    if (counterIndex > day - 1) {
      percentage = data[counterIndex - day].Actual - data[counterIndex].Actual;
    }
    return percentage.toFixed(3);
  }

  handleGetNews = () => {
    console.log("getNews"); 
    const { newsDate } = this.state;
    fetch(`${this.API_URL}api/Forecast/GetNews?date=${newsDate}`)
      .then(response => response.json())
      .then(result => {
        // TODO
        console.log(result); 
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };


  render() {
    const { data, startDate, endDate, forecastDays, calculating, counterIndex, counting, moneyEUR, moneyHUF, amount, isEuroToForint, history, newsDate } = this.state;
    return (
      <div className="App">
        <h2>Forecast</h2>
        <div className="calculate-form">
          <label htmlFor="startDate">Start Date:</label>
          <input type="date" id="startDate" name="startDate" value={startDate} onChange={this.handleInputChange} />
          <label htmlFor="endDate">End Date:</label>
          <input type="date" id="endDate" name="endDate" value={endDate} onChange={this.handleInputChange} />
          <label htmlFor="forecastDays">Forecast Days:</label>
          <input type="number" id="forecastDays" name="forecastDays" value={forecastDays} onChange={this.handleInputChange} />
          <button onClick={this.handleCalculate} disabled={calculating}>Calculate</button>
          <button onClick={this.handleManualRefresh}>Manual Refresh</button>
        </div>
        {calculating && <div className="calculating-indicator">Calculating...</div>}
        <div>
          <button onClick={this.handleStartCounter} disabled={counting}>Start</button>
          <button onClick={this.handleStopCounter} disabled={!counting}>Stop</button>
          <button onClick={this.handleReset}>Reset</button>
        </div>

        <div className="news-section">
          <label htmlFor="newsDate">News Date:</label>
          <input type="date" id="newsDate" name="newsDate" value={newsDate} onChange={this.handleInputChange} />
          <button onClick={this.handleGetNews}>Get News</button>
        </div>

        <table>
          <tr className='table2'>
            <th>EUR: {moneyEUR.toFixed(3)}</th>
            <th>HUF: {moneyHUF.toFixed(3)}</th>
          </tr>
          <tr>
            <td><button onClick={this.toggleExchangeDirection}> {isEuroToForint ? "EUR to HUF" : "HUF to EUR"} </button></td>
            <td><input type="number" id="amount" name="amount" value={amount} onChange={this.handleInputChange} /></td>
            <td><button onClick={this.handleExchange} disabled={counting}>Exchange</button></td>
          </tr>
        </table>
        <table>
          <thead>
            <tr className='table3'>
              <th>Exchange history</th>
              <th>Date</th>
              <th>Exchange rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td></td>
                <td>{this.formatDate(item.ds)}</td>
                <td>{item.exchangeRate.toFixed(3)}</td>
                <td>{item.amount.toFixed(0)}</td>
                <td>{item.direction}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className='table'>
          <thead>
            <tr>
              <th>Date</th>
              <th>Forecast</th>
              <th>Actual</th>
              <th>Changes: </th>
              <th>Last day</th>
              <th>Last 3 days</th>
              <th>Last 7 days</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 && (
              <tr>
                <td>{this.formatDate(data[counterIndex].ds)}</td>
                <td>{data[counterIndex].Forecast !== null ? data[counterIndex].Forecast.toFixed(3) : ''}</td>
                <td>{data[counterIndex].Actual !== null ? data[counterIndex].Actual.toFixed(3) : ''}</td>
                <td></td>
                <td style={{ color: this.lastDaysChanges(1) >= 0 ? 'green' : 'red' }}> {this.lastDaysChanges(1)}</td>
                <td style={{ color: this.lastDaysChanges(3) >= 0 ? 'green' : 'red' }}> {this.lastDaysChanges(3)}</td>
                <td style={{ color: this.lastDaysChanges(7) >= 0 ? 'green' : 'red' }}> {this.lastDaysChanges(7)}</td>
              </tr>
            )}
          </tbody>
          <tbody>
            <tr>
              <td colSpan="3"><hr /></td>
            </tr>
          </tbody>
          <tbody >
            {data.map((note, index) => (
              <tr key={index} style={{ background: index === counterIndex ? 'yellow' : 'transparent' }}>
                <td>{this.formatDate(note.ds)}</td>
                <td>{note.Forecast !== null ? note.Forecast.toFixed(3) : ''}</td>
                <td>{note.Actual !== null ? note.Actual.toFixed(3) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Forecast;