import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    let month = (d.getMonth() + 1).toString().padStart(2, '0');
    let day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatData(data, days) {
    // Copy the original data array
    const formattedData = data.map(item => Object.assign({}, item));

    // Find the index where the null values should start
    const nullIndex = Math.max(0, formattedData.length - days);

    // Fill the actual values from nullIndex to the end with null
    for (let i = nullIndex; i < formattedData.length; i++) {
        formattedData[i].Actual = null;
    }
    console.log(nullIndex, days, data.length)

    // Format and return the data
    return formattedData.map(item => ({
        ...item,
        ds: formatDate(item.ds),
        Forecast: item.Forecast !== null ? Number(item.Forecast.toFixed(3)) : null,
        Actual: item.Actual !== null ? Number(item.Actual.toFixed(3)) : null
    }));
}



function Chart ({ data, days }) {
    const dataCopy = [...data];
    const formattedData = formatData(dataCopy, days);
    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="80%" height="80%">
                <LineChart
                    width={500}
                    height={300}
                    data={formattedData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ds" interval={Math.ceil(data.length / 5)}/>
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Actual" stroke="#8884d8" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="Forecast" stroke="#82ca9d" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default Chart;
