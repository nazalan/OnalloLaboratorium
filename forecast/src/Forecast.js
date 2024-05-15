import React, { Component } from 'react';
import { Typography, Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { keyframes } from '@emotion/react';
import NewGameModal from './NewGameModal'; // importáljuk az új komponenst
import Chart from './Chart';


const primaryColor = '#ff4500';
const secondaryColor = '#00bfff';
const bgColor = '#f0f0f0';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 ${primaryColor};
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
`;

const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 0px ${secondaryColor};
  }
  50% {
    box-shadow: 0 0 15px ${secondaryColor};
  }
  100% {
    box-shadow: 0 0 0px ${secondaryColor};
  }
`;

class Forecast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataLoaded: false,
      data: [],
      startDate: "2010-01-01",
      endDate: "2011-01-01",
      forecastDays: 0,
      calculating: false,
      counterIndex: 0,
      counting: false,
      moneyEUR: 100,
      moneyHUF: 0,
      amount: 0,
      isEuroToForint: true,
      history: [],
      newsDate: '',
      newsText: "",
      loggedInUser: this.props.loggedInUser,
      loggedInUserId: this.props.loggedInUserId,
      newGameModalOpen: false,
      gettingNews: false
    };
    this.interval = null;
    this.API_URL = "http://localhost:5025/";
    this.handleExchange = this.handleExchange.bind(this);
    this.toggleExchangeDirection = this.toggleExchangeDirection.bind(this);
  }

  componentDidMount() {
    this.loadData()
    this.loadHistoryData()
    this.handleCalculate()
  }

  loadData() {
    fetch(`${this.API_URL}api/Forecast/LoadData?id=${this.props.loggedInUserId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.setState({
            startDate: this.formatDate(data.userData.StartDate),
            endDate: this.formatDate(data.userData.EndDate),
            forecastDays: data.userData.ForecastDays,
            counterIndex: data.userData.CounterIndex,
            moneyEUR: data.userData.EUR,
            moneyHUF: data.userData.HUF,
            newsDate: this.formatDate(data.userData.StartDate),
            dataLoaded: true
          });
        }
      });
  }

  loadHistoryData() {
    fetch(`${this.API_URL}api/Forecast/LoadHistoryData?id=${this.props.loggedInUserId}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          this.setState({ history: data });
        }
      });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async refreshData() {
    this.setState({ counting: false });
    const {counterIndex, newsDate } = this.state;
    console.log(counterIndex)
    fetch(this.API_URL + "api/Forecast/GetData")
      .then(response => response.json())
      .then(_data => {
        this.setState({ data: _data, newsDate: _data[counterIndex].ds })
        console.log(_data[counterIndex].ds)
        console.log(newsDate);
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
    const {startDate, endDate, forecastDays } = this.state;
    this.handleReset();
    this.setState({ calculating: true });
    fetch(`${this.API_URL}api/Forecast/Calculate?start_date=${startDate}&end_date=${endDate}&forecast_days=${forecastDays}`)
      .then(response => response.json())
      .then(result => {
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

  handelNewsDate = () =>{
    const {data, counterIndex } = this.state;
    this.setState({
      newsDate: this.formatDate(data[counterIndex].ds)
    });
  }

  handleStopCounter = () => {
    clearInterval(this.interval);
    this.handelNewsDate();
    this.setState({ counting: false });
  }

  handleReset = () => {
    const {data, forecastDays, counterIndex } = this.state;
    // this.handleStopCounter();
    this.setState({data:[], counting: false, counterIndex: 0, moneyEUR: 100, moneyHUF: 0, history: [] });
    // this.componentWillUnmount();
    this.setState(prevState => ({
      data: [],
      counting: false,
      counterIndex: 0,
      moneyEUR: 100,
      moneyHUF: 0,
      history: prevState.history // Ha szükséges, megtartjuk a history állapotot
    }));
    console.log(counterIndex+forecastDays+1)
    console.log(data.slice(0, counterIndex+forecastDays+1))
  }

  toggleExchangeDirection() {
    this.setState(prevState => ({
      isEuroToForint: !prevState.isEuroToForint,
      direction: prevState.isEuroToForint ? 1 : 0
    }));
  }

  handleExchange = () => {
    const { data, counterIndex, moneyEUR, moneyHUF, amount, isEuroToForint, history } = this.state;
    let updatedMoneyEUR = moneyEUR;
    let updatedMoneyHUF = moneyHUF;
    let exchangeRate = data[counterIndex].Actual;
    let newHistoryItem = {
      Date: data[counterIndex].ds,
      ExchangeRate: exchangeRate,
      Amount: Number(amount),
      Direction: isEuroToForint ? 0 : 1
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
    const { data, counterIndex, newsDate } = this.state;
    this.setState({ newsdate: data[counterIndex].ds });
    this.setState({ gettingNews: true });
    console.log(newsDate);
    fetch(`${this.API_URL}api/Forecast/GetNews?date=${newsDate}`)
      .then(response => response.json())
      .then(result => {
        this.setState({ newsText: result });
        console.log(result);
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        this.setState({ gettingNews: false });
      });
  };

  handleGetNewNews = () => {
    console.log("getNewNews");
    const { data, counterIndex, newsDate } = this.state;
    this.setState({ newsdate: data[counterIndex].ds });
    this.setState({ gettingNews: true });
    console.log(newsDate);
    fetch(`${this.API_URL}api/Forecast/GetNewNews?date=${newsDate}`)
      .then(response => response.json())
      .then(result => {
        this.setState({ newsText: result });
        console.log(result);
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        this.setState({ gettingNews: false });
      });
  };
  
  
  handleSaveData = () => {
    const { startDate, endDate, forecastDays, counterIndex, moneyEUR, moneyHUF, loggedInUserId } = this.state;
    const userData = {
      userID: loggedInUserId,
      startDate: startDate,
      endDate: endDate,
      forecastDays: forecastDays,
      eur: moneyEUR,
      huf: moneyHUF,
      counterIndex: counterIndex,
    };

    fetch(this.API_URL + "api/Forecast/SaveData", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log("User data saved successfully");
          this.saveHistoricalData(loggedInUserId);
        } else {
          console.error("Failed to save user data");
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  saveHistoricalData(userId) {
    const { history } = this.state;
    const formattedHistory = history.map(item => ({
      userID: userId,
      date: item.Date,
      exchangeRate: item.ExchangeRate,
      amount: item.Amount,
      direction: item.Direction
    }));

    fetch(this.API_URL + "api/Forecast/SaveHistoricalData", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedHistory)
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log("Historical data saved successfully");
        } else {
          console.error("Failed to save historical data");
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  handleNewGameClick = () => {
    this.setState({ newGameModalOpen: true });
  }

  handleCloseNewGameModal = () => {
    this.setState({ newGameModalOpen: false });
  }


  handleStartGame = (startDate, endDate, forecastDays) => {
    const { counterIndex, data } = this.state;
    this.setState({ 
      startDate: startDate,
      endDate: endDate,
      forecastDays: forecastDays 
    }, () => {
      console.log(this.state.startDate); // Ez már az új startDate-et fogja tartalmazni
      console.log(forecastDays)
      console.log(data.slice(0, counterIndex+forecastDays+1))
      this.handleCalculate(); // Ez csak azután fog lefutni, hogy a state frissült
    });
    this.handleReset();
  }
  

  render() {
    const {forecastDays, gettingNews, newGameModalOpen, dataLoaded, data, calculating, counterIndex, counting, moneyEUR, moneyHUF, amount, isEuroToForint, history, newsDate, loggedInUser, newsText } = this.state;
  
    if (!dataLoaded) {
      return <div>Loading...</div>;
    }
  
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box sx={{ flex: 1, backgroundColor: bgColor, padding: '20px' }}>
          <Typography variant="h3" sx={{ color: primaryColor, marginBottom: '20px' }}>Forecast</Typography>
          <Typography sx={{ color: primaryColor, marginBottom: '10px' }}>Logged in as: {loggedInUser}</Typography>
          {!calculating && (
            <div style={{ height: '44px' }}></div>
          )}
          {calculating && (
            <div style={{ }}>
              <Typography variant="body1" sx={{ color: primaryColor, marginBottom: '20px', animation: `${pulseAnimation} 1s infinite` }}>Calculating...</Typography>
            </div>
          )}
  
          <Box sx={{ marginBottom: '20px' }}>
            <Button onClick={this.handleNewGameClick} sx={{ backgroundColor: secondaryColor, color: '#000000', marginRight: '10px' }}>New Game</Button>
            <Button onClick={this.handleSaveData} sx={{ backgroundColor: secondaryColor, color: '#000000', marginLeft: '10px' }}>Save Data</Button>
          </Box>
          
          <NewGameModal open={newGameModalOpen} onClose={this.handleCloseNewGameModal} onStartGame={this.handleStartGame} />
          <Box sx={{ marginBottom: '20px' }}>
            <Button onClick={this.handleStartCounter} disabled={counting || calculating} sx={{ backgroundColor: secondaryColor, color: '#000000', marginRight: '10px'}}>Start</Button>
            <Button onClick={this.handleStopCounter} disabled={!counting || calculating} sx={{ backgroundColor: secondaryColor, color: '#000000', marginRight: '10px' }}>Stop</Button>
          </Box>
          <Box sx={{ marginBottom: '20px' }}>
            <Button onClick={this.handleGetNews} disabled={counting || calculating || gettingNews} sx={{ backgroundColor: secondaryColor, color: '#000000', marginLeft: '10px' }}>Get News</Button>
          </Box>
  
          {!gettingNews && (
            <div style={{ height: '44px' }}></div>
          )}
          {gettingNews && (
            <div style={{ }}>
              <Typography variant="body1" sx={{ color: primaryColor, marginBottom: '20px', animation: `${pulseAnimation} 1s infinite` }}>Getting news...</Typography>
            </div>
          )}
          {newsText.length > 0 && (
            <div>
              <Typography variant="h5">News</Typography>
              {newsText.split("\r\n").map((item, index) => (
                <Typography key={index}>{item}</Typography>
              ))}
              <Box sx={{ marginBottom: '20px' }}>
            <Button onClick={this.handleGetNewNews} disabled={counting || calculating || gettingNews} sx={{ backgroundColor: secondaryColor, color: '#000000', marginLeft: '10px' }}>Get New News</Button>
              </Box>
            </div>
          )}
          {newsText.length <= 0 && (
            <div>
              <Typography variant="h5">News</Typography>
              <Typography>No news for this date yet</Typography>
            </div>
          )}
          <Chart data={data.slice(0, counterIndex+forecastDays+1)} days={forecastDays} />
  
          <TableContainer>
            <Table sx={{ marginBottom: '20px' }}>
              <TableHead>
                <TableRow>
                  <TableCell>EUR: {moneyEUR.toFixed(3)}</TableCell>
                  <TableCell>HUF: {moneyHUF.toFixed(3)}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Button onClick={this.toggleExchangeDirection} sx={{ backgroundColor: secondaryColor, color: '#000000' }}>{isEuroToForint ? "EUR to HUF" : "HUF to EUR"}</Button></TableCell>
                  <TableCell><input type="number" id="amount" name="amount" value={amount} onChange={this.handleInputChange} sx={{ animation: `${glowAnimation} 2s infinite` }} /></TableCell>
                  <TableCell><Button onClick={this.handleExchange} disabled={counting} sx={{ backgroundColor: secondaryColor, color: '#000000' }}>Exchange</Button></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <TableContainer>
            <Table sx={{ marginBottom: '20px' }}>
              <TableHead>
                <TableRow>
                  <TableCell>Exchange history</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Exchange rate</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell></TableCell>
                    <TableCell>{this.formatDate(item.Date)}</TableCell>
                    <TableCell>{item.ExchangeRate.toFixed(3)}</TableCell>
                    <TableCell>{item.Amount.toFixed(0)}</TableCell>
                    <TableCell>{item.Direction === 0 ? "EUR to HUF" : "HUF to EUR"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Forecast</TableCell>
                  <TableCell>Actual</TableCell>
                  <TableCell>Changes:</TableCell>
                  <TableCell>Last day</TableCell>
                  <TableCell>Last 3 days</TableCell>
                  <TableCell>Last 7 days</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 && (
                  <TableRow>
                    <TableCell>{this.formatDate(data[counterIndex].ds)}</TableCell>
                    <TableCell>{data[counterIndex].Forecast !== null ? data[counterIndex].Forecast.toFixed(3) : ''}</TableCell>
                    <TableCell>{data[counterIndex].Actual !== null ? data[counterIndex].Actual.toFixed(3) : ''}</TableCell>
                    <TableCell></TableCell>
                    <TableCell style={{ color: this.lastDaysChanges(1) >= 0 ? 'green' : 'red' }}>{this.lastDaysChanges(1)}</TableCell>
                    <TableCell style={{ color: this.lastDaysChanges(3) >= 0 ? 'green' : 'red' }}>{this.lastDaysChanges(3)}</TableCell>
                    <TableCell style={{ color: this.lastDaysChanges(7) >= 0 ? 'green' : 'red' }}>{this.lastDaysChanges(7)}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan="3"><hr /></TableCell>
                </TableRow>
                {data.map((note, index) => (
                  <TableRow key={index} sx={{ background: index === counterIndex ? 'yellow' : 'transparent' }}>
                    <TableCell>{this.formatDate(note.ds)}</TableCell>
                    <TableCell>{note.Forecast !== null ? note.Forecast.toFixed(3) : ''}</TableCell>
                    <TableCell>{note.Actual !== null ? note.Actual.toFixed(3) : ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    );
  }
}

export default Forecast;
