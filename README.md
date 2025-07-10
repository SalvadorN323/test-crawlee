# NBA Standings Crawler

A Node.js web scraper that extracts current NBA standings data from Basketball Reference and exports it in both JSON and CSV formats.

## Overview

This crawler automatically fetches the latest NBA standings for the 2024-25 season from Basketball Reference, parsing both Eastern and Western Conference standings with detailed team statistics including wins, losses, win percentage, games behind, and more.

## Features

- 🏀 **Complete NBA Standings**: Fetches both Eastern and Western Conference standings
- 📊 **Detailed Statistics**: Includes wins, losses, win percentage, games behind, points for/against, point differential, streak, and last ten games
- 📁 **Multiple Output Formats**: Exports data in both JSON and CSV formats
- 🔍 **Robust Parsing**: Handles various table structures and includes extensive debugging
- 📈 **Real-time Data**: Fetches current standings from the official Basketball Reference website

## Prerequisites

Before running the crawler, ensure you have:

- Node.js (version 14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone or download the project files
2. Install the required dependencies:

```bash
npm install crawlee cheerio fs
```

## Usage

### Basic Usage

Run the crawler with a simple command:

```bash
node nba-standings-crawler.js
```

### What It Does

1. **Connects** to Basketball Reference's NBA standings page
2. **Identifies** Eastern and Western Conference tables
3. **Extracts** team data including:
   - Conference (Eastern/Western)
   - Rank (1-15)
   - Team name
   - Wins and losses
   - Win percentage
   - Games behind leader
   - Points for/against per game
   - Point differential
   - Current streak
   - Last ten games record
4. **Exports** data to two files:
   - `nba-standings-2024-25.json` - JSON format
   - `nba-standings-2024-25.csv` - CSV format

### Output Files

#### JSON Format (`nba-standings-2024-25.json`)
```json
[
  {
    "conference": "Eastern",
    "rank": "1",
    "team": "Boston Celtics",
    "wins": "45",
    "losses": "12",
    "winPct": ".789",
    "gamesBehind": "-",
    "pointsFor": "120.1",
    "pointsAgainst": "110.2",
    "pointsDiff": "+9.9",
    "streak": "W3",
    "lastTen": "8-2"
  }
]
```

#### CSV Format (`nba-standings-2024-25.csv`)
```csv
Conference,Rank,Team,Wins,Losses,Win Percentage,Games Behind,Points For,Points Against,Point Differential,Streak,Last Ten
Eastern,1,Boston Celtics,45,12,.789,-,120.1,110.2,+9.9,W3,8-2
Western,1,Oklahoma City Thunder,43,14,.754,-,118.7,109.3,+9.4,W2,7-3
```

## Configuration

### Crawler Settings

The crawler is configured with:
- `maxRequestsPerCrawl: 1` - Only processes the standings page
- Robust error handling and debugging
- Multiple fallback parsing strategies

### Customization

You can modify the crawler by:

1. **Changing the season**: Update the URL in the `runCrawler()` function
2. **Adding more statistics**: Modify the data extraction logic to include additional table columns
3. **Changing output format**: Customize the CSV headers or JSON structure
4. **Adjusting debugging**: Remove or modify the debugging logs for cleaner output

## Data Structure

Each team record contains the following fields:

| Field | Description | Example |
|-------|-------------|---------|
| `conference` | Eastern or Western | "Eastern" |
| `rank` | Conference ranking (1-15) | "1" |
| `team` | Team name | "Boston Celtics" |
| `wins` | Number of wins | "45" |
| `losses` | Number of losses | "12" |
| `winPct` | Win percentage | ".789" |
| `gamesBehind` | Games behind conference leader | "2.5" |
| `pointsFor` | Average points scored per game | "120.1" |
| `pointsAgainst` | Average points allowed per game | "110.2" |
| `pointsDiff` | Point differential per game | "+9.9" |
| `streak` | Current win/loss streak | "W3" |
| `lastTen` | Record in last 10 games | "8-2" |

## Error Handling

The crawler includes comprehensive error handling:

- **Connection errors**: Logged with detailed error messages
- **Parsing errors**: Multiple fallback strategies for different table structures
- **Missing data**: Graceful handling of optional fields
- **Debug logging**: Extensive logging to help troubleshoot issues

## Debugging

The crawler includes detailed debugging output that shows:
- Whether expected page elements are found
- Table structure analysis
- Row-by-row processing details
- Data extraction results

To reduce debug output, remove or comment out the debugging sections in the `requestHandler` function.

## Limitations

- **Rate limiting**: Respects Basketball Reference's server by limiting to one request
- **Season specific**: Currently configured for the 2024-25 season
- **Structure dependent**: Relies on Basketball Reference's current HTML structure
- **Static data**: Captures standings at the time of execution (not real-time)

## Troubleshooting

### Common Issues

1. **No data extracted**: Check the debug logs to see if tables are being found
2. **Incorrect team names**: The HTML structure may have changed - check the parsing logic
3. **Missing statistics**: Some columns may not be available - check the table structure
4. **Connection errors**: Verify internet connection and Basketball Reference availability

### Getting Help

If you encounter issues:

1. Check the console output for debugging information
2. Verify the Basketball Reference URL is accessible
3. Ensure all dependencies are installed correctly
4. Review the HTML structure of the target page

## License

This project is for educational and personal use. Please respect Basketball Reference's terms of service and use responsibly.

## Contributing

Feel free to submit issues or pull requests to improve the crawler's functionality or add new features.

---

**Note**: This crawler is not affiliated with Basketball Reference or the NBA. It's an independent tool for educational purposes.