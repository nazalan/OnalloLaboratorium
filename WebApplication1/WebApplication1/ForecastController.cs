using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;

namespace WebApplication1
{
	[Route("api/[controller]")]
	[ApiController]
	public class ForecastController : ControllerBase
	{
		private readonly IConfiguration _configuration;
		private readonly UserManager _userManager;
		private readonly DataProcessor _dataProcessor;

		public ForecastController(IConfiguration configuration, UserManager userManager, DataProcessor dataProcessor)
		{
			_configuration = configuration;
			_userManager = userManager;
			_dataProcessor = dataProcessor;
		}

		[HttpGet]
		[Route("GetData")]
		public JsonResult GetData()
		{
			string query = "SELECT * FROM [exchangeRate].[dbo].[ForecastResults] ORDER BY ds";
			DataTable table = new DataTable();
			string connectionString = _configuration.GetConnectionString("DefaultConnection");
			using (SqlConnection myCon = new SqlConnection(connectionString))
			{
				myCon.Open();
				using (SqlCommand myCommand = new SqlCommand(query, myCon))
				{
					SqlDataReader myReader = myCommand.ExecuteReader();
					table.Load(myReader);
				}
			}

			return new JsonResult(table);
		}


		[HttpPost]
		[Route("Login")]
		public JsonResult Login([FromBody] User user)
		{
			return new JsonResult(_userManager.Login(user.Username, user.Password));
		}


		[HttpPost]
		[Route("Registration")]
		public JsonResult Registration([FromBody] User user)
		{
			return new JsonResult(_userManager.Registration(user.Username, user.Password));
		}

		[HttpGet]
		[Route("LoadData")]
		public JsonResult LoadData(string username)
		{
			return new JsonResult(_userManager.LoadData(username));
		}

		[HttpGet]
		[Route("LoadHistoryData")]
		public JsonResult LoadHistoryData(string username)
		{
			return new JsonResult(_userManager.LoadHistoryData(username));
		}

		[HttpPost]
		[Route("SaveData")]
		public JsonResult SaveData([FromBody] UserData userData)
		{
			return new JsonResult(_userManager.SaveUserData(userData));
		}

		[HttpPost]
		[Route("SaveHistoricalData")]
		public JsonResult SaveHistoricalData([FromBody] List<HistoricalData> historicalDataList)
		{
			return new JsonResult(_userManager.SaveHistoricalData(historicalDataList));
		}


		[HttpGet]
		[Route("Calculate")]
		public JsonResult Calculate(DateTime start_date, DateTime end_date, int forecast_days)
		{
			return _dataProcessor.Calculate(start_date, end_date, forecast_days);
		}

		[HttpGet]
		[Route("GetNews")]
		public JsonResult GetNews(DateTime date)
		{
			return _dataProcessor.GetNews(date);
		}
	}
}
