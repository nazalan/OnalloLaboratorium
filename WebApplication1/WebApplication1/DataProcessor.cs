using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Data.SqlClient;

namespace WebApplication1
{
	public class DataProcessor
	{
		private readonly IConfiguration _configuration;
		private readonly PythonScriptRunner _scriptRunner;

		public DataProcessor(IConfiguration configuration, PythonScriptRunner scriptRunner)
		{
			_configuration = configuration;
			_scriptRunner = scriptRunner;
		}

		public JsonResult Calculate(DateTime start_date, DateTime end_date, int forecast_days)
		{
			string pythonPath = @"C:\Users\ThinkPad\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\python.exe";
			string scriptPath = @"C:\work\OnalloLaboratorium\forecast.py";
			string arguments = $"{start_date.ToString("yyyy-MM-dd")} {end_date.ToString("yyyy-MM-dd")} {forecast_days}";

			string result = _scriptRunner.RunPythonScript(pythonPath, scriptPath, arguments);

			return new JsonResult("Calculated");
		}

		public string GetNews(DateTime date)
		{
			string pythonPath = @"C:\Users\ThinkPad\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\python.exe";
			string scriptPath = @"C:\work\OnalloLaboratorium\workspace\news.py";
			string arguments = $"{date.ToString("yyyy-MM-dd")}";

			string result = _scriptRunner.RunPythonScript(pythonPath, scriptPath, arguments);

			return result;
		}
	}
}
