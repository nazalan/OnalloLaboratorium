public class HistoricalData
{
	public int UserID { get; set; }
	public DateTime Date { get; set; }
	public decimal ExchangeRate { get; set; }
	public decimal Amount { get; set; }

	public int Direction { get; set; }
}
