import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error
from math import sqrt
import pyodbc
import warnings

warnings.filterwarnings('ignore')

# Adatok beolvasása és előkészítése
# Kapcsolat létrehozása a SQL Serverrel
connection = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER=(localdb)\onlab;DATABASE=ExchangeRate;Trusted_Connection=yes')

# Paraméterek fogadása
start_date = sys.argv[1] if len(sys.argv) > 1 else '2019-01-03'  # Default 2005-01-03
end_date = sys.argv[2] if len(sys.argv) > 2 else '2020-01-01'  # Default 2024-01-01
forecast_days = int(sys.argv[3]) if len(sys.argv) > 3 else 100  # Default 365

# SQL lekérdezés a kezdő és vég dátumok alapján
query = f"SELECT Date, Price FROM exchangeRate WHERE Date BETWEEN '{start_date}' AND '{end_date}'"
df = pd.read_sql(query, connection)
df['Date'] = pd.to_datetime(df['Date'])

# Dátumformátum átalakítása és időindex létrehozása
df.rename(columns={'Date': 'ds', 'Price': 'y'}, inplace=True)

# Prophet modell létrehozása és illesztése
model = Prophet(changepoint_prior_scale=0.5)
model.fit(df)

# Jövőbeli időpontok előrejelzése
future = model.make_future_dataframe(periods=forecast_days, freq='D')
forecast = model.predict(future)

# Hiba metrikák kiszámítása
y_true = df['y']._append(forecast[forecast['ds'].isin(df['ds']) == False]['yhat'])
y_pred = forecast['yhat']
mae = mean_absolute_error(y_true, y_pred)
mse = mean_squared_error(y_true, y_pred)
rmse = sqrt(mse)

# Eredmények kiírása
print("Mean Absolute Error (MAE):", mae)
print("Mean Squared Error (MSE):", mse)
print("Root Mean Squared Error (RMSE):", rmse)

# Eredeti adatok hozzáadása a forecast DataFrame-hez
forecast_with_actuals = pd.merge(forecast[['ds', 'yhat']], df[['ds', 'y']], on='ds', how='left')
forecast_with_actuals.rename(columns={'y': 'Actual', 'yhat': 'Forecast'}, inplace=True)
forecast_with_actuals['Actual'] = forecast_with_actuals['Actual'].astype(float)
forecast_with_actuals['Forecast'] = forecast_with_actuals['Forecast'].astype(float)

# Táblázat készítése és adatbázisba mentése
cursor = connection.cursor()
# Tábla összes sorának törlése
delete_query = "DELETE FROM ForecastResults"
cursor.execute(delete_query)
connection.commit()

for index, row in forecast_with_actuals.iterrows():
    # Az üres helyeket None értékekkel helyettesítjük
    ds_value = row['ds'] if not pd.isnull(row['ds']) else None
    actual_value = row['Actual'] if not pd.isnull(row['Actual']) else None
    forecast_value = row['Forecast'] if not pd.isnull(row['Forecast']) else None
    
    # Az INSERT lekérdezés végrehajtása
    insert_query = "INSERT INTO ForecastResults (ds, Actual, Forecast) VALUES (?, ?, ?)"
    cursor.execute(insert_query, (ds_value, actual_value, forecast_value))

# Tranzakció véglegesítése
connection.commit()
