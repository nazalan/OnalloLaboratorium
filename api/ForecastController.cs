using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
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

        public ForecastController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        [Route("GetData")]
        public JsonResult GetData()
        {
			string query = "SELECT * FROM [exchangeRate].[dbo].[ForecastResults] ORDER BY ds";
			DataTable table = new DataTable();
            string connectionString = @"Data Source=(localdb)\onlab;Initial Catalog=exchangeRate;Integrated Security=True;";
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

        [HttpGet]
        [Route("Calculate")]
        public JsonResult Calculate(DateTime start_date, DateTime end_date, int forecast_days)
        {
            // Először meghívjuk a Python szkriptet és átadjuk neki a szükséges paramétereket
            string pythonPath = @"C:\Users\ThinkPad\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\python.exe";
            string scriptPath = @"C:\work\onlab\forecast.py";
            string arguments = $"{start_date.ToString("yyyy-MM-dd")} {end_date.ToString("yyyy-MM-dd")} {forecast_days}";

            string result = RunPythonScript(pythonPath, scriptPath, arguments);

            // Az eredmény visszaadása
            return new JsonResult("Calculated");
        }


        private string RunPythonScript(string pythonPath, string scriptPath, string arguments)
        {
            // Process létrehozása a Python szkript futtatásához
            ProcessStartInfo startInfo = new ProcessStartInfo();
            startInfo.FileName = pythonPath;
            startInfo.Arguments = $"{scriptPath} {arguments}"; // A Python szkript elérési útvonala és a paraméterek hozzáadása
            startInfo.UseShellExecute = false;
            startInfo.RedirectStandardOutput = true;

            // Process indítása
            using (Process process = Process.Start(startInfo))
            {
                // Várakozás a szkript végéig
                process.WaitForExit();

                // Python szkript kimenetének olvasása
                string output = process.StandardOutput.ReadToEnd();

                // Az eredmény visszaadása
                return output;
            }
        }
    }
}
