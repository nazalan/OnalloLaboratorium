import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: [],
      startDate: '',
      endDate: '',
      forecastDays: '',
      calculating: false // Alapértelmezetten nincs folyamatban kalkuláció
    };
  }

  API_URL = "http://localhost:5025/";

  componentDidMount() {
    this.refreshNotes();
  }

  async refreshNotes() {
    fetch(this.API_URL + "api/TodoApp/GetData")
      .then(response => response.json())
      .then(data => {
        this.setState({ notes: data });
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
    // Kalkuláció kezdete, a calculating állapot beállítása true-ra
    this.setState({ calculating: true });
    fetch(`${this.API_URL}api/TodoApp/Calculate?start_date=${startDate}&end_date=${endDate}&forecast_days=${forecastDays}`)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        this.refreshNotes(); // Adatok frissítése a kalkuláció után
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        // Kalkuláció befejeződése, a calculating állapot visszaállítása false-ra
        this.setState({ calculating: false });
      });
  }

  handleManualRefresh = () => {
    this.refreshNotes();
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  render() {
    const { notes, startDate, endDate, forecastDays, calculating } = this.state;
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
        {calculating && <div className="loading-indicator">Loading...</div>} {/* Töltési animáció megjelenítése, ha folyamatban van a kalkuláció */}
        <table className='table'>
          <thead>
            <tr>
              <th>Date</th>
              <th>Forecast</th>
              <th>Actual</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note, index) => (
              <tr key={index}>
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

export default App;
