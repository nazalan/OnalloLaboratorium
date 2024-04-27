import React, { Component } from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';

class NewGameModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: '2010-01-01',
      endDate: '2011-01-01',
      forecastDays: '20'
    };
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleStartGame = () => {
    const { startDate, endDate, forecastDays } = this.state;

    this.props.onStartGame(startDate, endDate, forecastDays);
    this.props.onClose();
  }

  render() {
    const { open, onClose } = this.props;
    const { startDate, endDate, forecastDays } = this.state;

    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, width: 400 }}>
          <TextField
            label="Start Date"
            type="date"
            name="startDate"
            value={startDate}
            onChange={this.handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="End Date"
            type="date"
            name="endDate"
            value={endDate}
            onChange={this.handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Forecast Days"
            type="number"
            name="forecastDays"
            value={forecastDays}
            onChange={this.handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <Button onClick={this.handleStartGame} sx={{ mr: 2 }}>Start Game</Button>
          <Button onClick={onClose}>Cancel</Button>
        </Box>
      </Modal>
    );
  }
}

export default NewGameModal;
