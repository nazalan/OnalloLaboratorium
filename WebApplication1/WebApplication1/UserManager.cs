using Microsoft.Extensions.Configuration;
using System.Data;
using System.Data.SqlClient;

namespace WebApplication1
{
	public class UserManager
	{
		private readonly IConfiguration _configuration;

		public UserManager(IConfiguration configuration)
		{
			_configuration = configuration;
		}

		public object Login(string username, string password)
		{
			string connectionString = _configuration.GetConnectionString("DefaultConnection");
			using (SqlConnection connection = new SqlConnection(connectionString))
			{
				string query = "SELECT Id FROM Users WHERE Username = @Username AND Password = @Password";
				using (SqlCommand command = new SqlCommand(query, connection))
				{
					command.Parameters.AddWithValue("@Username", username);
					command.Parameters.AddWithValue("@Password", password);

					connection.Open();
					SqlDataReader reader = command.ExecuteReader();

					if (reader.Read())
					{
						int userId = (int)reader["Id"];
						return new { success = true, message = "Login successful", userId };
					}
					return new { success = false, message = "Invalid username or password" };
				}
			}
		}



		public object Registration(string username, string password)
		{
			string connectionString = _configuration.GetConnectionString("DefaultConnection");
			using (SqlConnection connection = new SqlConnection(connectionString))
			{
				connection.Open();

				string checkQuery = "SELECT COUNT(1) FROM Users WHERE Username = @Username";
				using (SqlCommand checkCommand = new SqlCommand(checkQuery, connection))
				{
					checkCommand.Parameters.AddWithValue("@Username", username);
					int existingUserCount = (int)checkCommand.ExecuteScalar();

					if (existingUserCount > 0)
					{
						return new { success = false, message = "Username already exists" };
					}
				}

				string insertQuery = "INSERT INTO Users (Username, Password) VALUES (@Username, @Password)";
				using (SqlCommand command = new SqlCommand(insertQuery, connection))
				{
					command.Parameters.AddWithValue("@Username", username);
					command.Parameters.AddWithValue("@Password", password);

					command.ExecuteNonQuery();
				}

				return new { success = true, message = "User registration successful" };
			}

		}

		public object LoadData(int userId)
		{
			string connectionString = _configuration.GetConnectionString("DefaultConnection");
			using (SqlConnection connection = new SqlConnection(connectionString))
			{
				connection.Open();

				// Most pedig lekérjük a felhasználóhoz tartozó adatokat a ForecastData táblából
				string query = "SELECT TOP 1 * FROM ForecastData WHERE UserID = @UserID";
				using (SqlCommand command = new SqlCommand(query, connection))
				{
					command.Parameters.AddWithValue("@UserID", userId);
					using (SqlDataReader reader = command.ExecuteReader())
					{
						if (reader.Read())
						{
							UserData userData = new UserData
							{
								UserID = userId,
								StartDate = reader.GetDateTime(reader.GetOrdinal("startDate")),
								EndDate = reader.GetDateTime(reader.GetOrdinal("endDate")),
								ForecastDays = reader.GetInt32(reader.GetOrdinal("forecastDays")),
								EUR = reader.GetDecimal(reader.GetOrdinal("EUR")),
								HUF = reader.GetDecimal(reader.GetOrdinal("HUF")),
								CounterIndex = reader.GetInt32(reader.GetOrdinal("counterIndex"))
							};
							return new { success = true, userData };
						}
						else
						{
							return new { success = false, message = "No data found for the user" };
						}
					}
				}
			}
		}

		public object LoadHistoryData(int userId)
		{
			string connectionString = _configuration.GetConnectionString("DefaultConnection");
			using (SqlConnection connection = new SqlConnection(connectionString))
			{
				connection.Open();

				// Most pedig lekérjük a felhasználóhoz tartozó történelmi adatokat a HistroyData táblából
				string query = "SELECT * FROM HistroyData WHERE UserID = @UserID";
				List<HistoricalData> historicalDataList = new List<HistoricalData>();
				using (SqlCommand command = new SqlCommand(query, connection))
				{
					command.Parameters.AddWithValue("@UserID", userId);
					using (SqlDataReader reader = command.ExecuteReader())
					{
						while (reader.Read())
						{
							HistoricalData historicalData = new HistoricalData
							{
								UserID = userId,
								Date = reader.GetDateTime(reader.GetOrdinal("ds")),
								ExchangeRate = reader.GetDecimal(reader.GetOrdinal("exchangeRate")),
								Amount = reader.GetDecimal(reader.GetOrdinal("amount")),
								Direction = reader.GetInt32(reader.GetOrdinal("direction"))
							};
							historicalDataList.Add(historicalData);
						}
					}
				}

				return historicalDataList;
			}
		}

		public object SaveUserData(UserData userData)
    {
        string connectionString = _configuration.GetConnectionString("DefaultConnection");
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();

            // Ellenőrizzük, hogy van-e már adat a felhasználó számára az adatbázisban
            string checkQuery = "SELECT COUNT(1) FROM ForecastData WHERE UserID = @UserID";
            using (SqlCommand checkCommand = new SqlCommand(checkQuery, connection))
            {
                checkCommand.Parameters.AddWithValue("@UserID", userData.UserID);
                int existingDataCount = (int)checkCommand.ExecuteScalar();

                if (existingDataCount > 0)
                {
                    // Ha már van adat, frissítjük azt az új adatokkal
                    string updateQuery = @"UPDATE ForecastData 
                                           SET StartDate = @StartDate, 
                                               EndDate = @EndDate, 
                                               ForecastDays = @ForecastDays, 
                                               EUR = @EUR, 
                                               HUF = @HUF, 
                                               CounterIndex = @CounterIndex 
                                           WHERE UserID = @UserID";
                    using (SqlCommand updateCommand = new SqlCommand(updateQuery, connection))
                    {
                        updateCommand.Parameters.AddWithValue("@StartDate", userData.StartDate);
                        updateCommand.Parameters.AddWithValue("@EndDate", userData.EndDate);
                        updateCommand.Parameters.AddWithValue("@ForecastDays", userData.ForecastDays);
                        updateCommand.Parameters.AddWithValue("@EUR", userData.EUR);
                        updateCommand.Parameters.AddWithValue("@HUF", userData.HUF);
                        updateCommand.Parameters.AddWithValue("@CounterIndex", userData.CounterIndex);
                        updateCommand.Parameters.AddWithValue("@UserID", userData.UserID);

                        updateCommand.ExecuteNonQuery();
                    }
                }
                else
                {
                    // Ha nincs még adat a felhasználó számára, akkor új rekordként mentjük el
                    string insertQuery = @"INSERT INTO ForecastData (UserID, StartDate, EndDate, ForecastDays, EUR, HUF, CounterIndex) 
                                           VALUES (@UserID, @StartDate, @EndDate, @ForecastDays, @EUR, @HUF, @CounterIndex)";
                    using (SqlCommand insertCommand = new SqlCommand(insertQuery, connection))
                    {
                        insertCommand.Parameters.AddWithValue("@UserID", userData.UserID);
                        insertCommand.Parameters.AddWithValue("@StartDate", userData.StartDate);
                        insertCommand.Parameters.AddWithValue("@EndDate", userData.EndDate);
                        insertCommand.Parameters.AddWithValue("@ForecastDays", userData.ForecastDays);
                        insertCommand.Parameters.AddWithValue("@EUR", userData.EUR);
                        insertCommand.Parameters.AddWithValue("@HUF", userData.HUF);
                        insertCommand.Parameters.AddWithValue("@CounterIndex", userData.CounterIndex);

                        insertCommand.ExecuteNonQuery();
                    }
                }
            }

            return new { success = true, message = "User data saved successfully" };
        }
    }

		public object SaveHistoricalData(List<HistoricalData> historicalDataList)
		{
			if (historicalDataList == null || historicalDataList.Count == 0)
			{
				return new { success = false, message = "Historical data list is empty or null." };
			}

			string connectionString = _configuration.GetConnectionString("DefaultConnection");
			using (SqlConnection connection = new SqlConnection(connectionString))
			{
				connection.Open();

				// Összes történelmi adat törlése az adatbázisból
				string deleteQuery = @"DELETE FROM HistroyData WHERE UserID = @UserID";
				using (SqlCommand deleteCommand = new SqlCommand(deleteQuery, connection))
				{
					deleteCommand.Parameters.AddWithValue("@UserID", historicalDataList[0].UserID);
					deleteCommand.ExecuteNonQuery();
				}

				// Minden történelmi adatot beillesztünk az adatbázisba
				foreach (var historicalData in historicalDataList)
				{
					string insertQuery = @"INSERT INTO HistroyData (UserID, ds, exchangeRate, amount, Direction) 
                                   VALUES (@UserID, @Date, @ExchangeRate, @Amount, @Direction)";
					using (SqlCommand insertCommand = new SqlCommand(insertQuery, connection))
					{
						insertCommand.Parameters.AddWithValue("@UserID", historicalData.UserID);
						insertCommand.Parameters.AddWithValue("@Date", historicalData.Date);
						insertCommand.Parameters.AddWithValue("@ExchangeRate", historicalData.ExchangeRate);
						insertCommand.Parameters.AddWithValue("@Amount", historicalData.Amount);
						insertCommand.Parameters.AddWithValue("@Direction", historicalData.Direction);

						insertCommand.ExecuteNonQuery();
					}
				}

				return new { success = true, message = "Historical data saved successfully" };
			}
		}






	}
}
