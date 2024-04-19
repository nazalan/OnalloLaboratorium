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
				string query = "SELECT COUNT(1) FROM Users WHERE Username = @Username AND Password = @Password";
				using (SqlCommand command = new SqlCommand(query, connection))
				{
					command.Parameters.AddWithValue("@Username", username);
					command.Parameters.AddWithValue("@Password", password);

					connection.Open();
					int count = (int)command.ExecuteScalar();

					if (count == 1)
					{
						return new { success = true, message = "Login successful" };
					}
					else
					{
						return new { success = false, message = "Invalid username or password" };
					}
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
	}
}
