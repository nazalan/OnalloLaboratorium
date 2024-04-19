using System;
using System.Diagnostics;

namespace WebApplication1
{
	public class PythonScriptRunner
	{
		public string RunPythonScript(string pythonPath, string scriptPath, string arguments)
		{
			string output = string.Empty;

			ProcessStartInfo startInfo = new ProcessStartInfo();
			startInfo.FileName = pythonPath;
			startInfo.Arguments = $"{scriptPath} {arguments}";
			startInfo.UseShellExecute = false;
			startInfo.RedirectStandardOutput = true;

			try
			{
				using (Process process = Process.Start(startInfo))
				{
					if (process != null)
					{
						process.WaitForExit();
						output = process.StandardOutput.ReadToEnd();
					}
					else
					{
						// Ha a process null, valamilyen hiba történt a futtatás során
						output = "Error: Process could not be started.";
					}
				}
			}
			catch (Exception ex)
			{
				// Hiba történt a folyamat indítása közben
				output = $"Error: {ex.Message}";
			}

			return output;
		}
	}
}
