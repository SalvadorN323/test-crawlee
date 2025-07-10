import { CheerioCrawler, Dataset } from 'crawlee';
import fs from 'fs';

// Create the crawler
const crawler = new CheerioCrawler({
    // Limit the crawl to just the standings page
    maxRequestsPerCrawl: 1,
    
    async requestHandler({ $, request, log }) {
        log.info(`Processing ${request.url}`);
        
        // Extract NBA standings data
        const standings = [];
        
        // Find both Eastern and Western Conference tables
        const conferenceTables = $('#div_confs_standings_E, #div_confs_standings_W');
        
        conferenceTables.each((index, table) => {
            const conference = $(table).find('h2').text().trim();
            const tableBody = $(table).find('tbody');
            
            tableBody.find('tr').each((rowIndex, row) => {
                const cells = $(row).find('td, th');
                if (cells.length > 0) {
                    const team = {
                        conference: conference,
                        rank: $(cells[0]).text().trim(),
                        team: $(cells[1]).text().trim(),
                        wins: $(cells[2]).text().trim(),
                        losses: $(cells[3]).text().trim(),
                        winPct: $(cells[4]).text().trim(),
                        gamesBehind: $(cells[5]).text().trim(),
                        pointsFor: $(cells[6]).text().trim(),
                        pointsAgainst: $(cells[7]).text().trim(),
                        pointsDiff: $(cells[8]).text().trim(),
                        streak: $(cells[9]).text().trim(),
                        lastTen: $(cells[10]).text().trim()
                    };
                    
                    // Only add if team name exists (skip header rows)
                    if (team.team && team.team !== 'Team') {
                        standings.push(team);
                    }
                }
            });
        });
        
        // If conference tables not found, try the main standings table
        if (standings.length === 0) {
            const mainTable = $('#standings');
            mainTable.find('tbody tr').each((rowIndex, row) => {
                const cells = $(row).find('td, th');
                if (cells.length > 0) {
                    const team = {
                        rank: $(cells[0]).text().trim(),
                        team: $(cells[1]).text().trim(),
                        wins: $(cells[2]).text().trim(),
                        losses: $(cells[3]).text().trim(),
                        winPct: $(cells[4]).text().trim(),
                        gamesBehind: $(cells[5]).text().trim(),
                        streak: $(cells[6]).text().trim()
                    };
                    
                    if (team.team && team.team !== 'Team') {
                        standings.push(team);
                    }
                }
            });
        }
        
        log.info(`Found ${standings.length} teams in standings`);
        
        // Save each team record to the dataset
        for (const team of standings) {
            await Dataset.pushData(team);
        }
        
        // Also save a summary
        await Dataset.pushData({
            type: 'summary',
            totalTeams: standings.length,
            scrapedAt: new Date().toISOString(),
            url: request.url
        });
    },
    
    // Handle failed requests
    failedRequestHandler({ request, error, log }) {
        log.error(`Request ${request.url} failed: ${error.message}`);
    },
});

// Run the crawler
async function runCrawler() {
    console.log('Starting NBA Standings Crawler...');
    
    // Add the NBA standings URL
    await crawler.addRequests([
        'https://www.basketball-reference.com/leagues/NBA_2025_standings.html'
    ]);
    
    // Run the crawler
    await crawler.run();
    
    console.log('Crawler finished! Check the storage/datasets/default folder for results.');
    
    // Export data to JSON file for easy viewing
    const dataset = await Dataset.open();
    const data = await dataset.getData();
    
    // Write to a JSON file
    fs.writeFileSync('nba-standings-2024-25.json', JSON.stringify(data.items, null, 2));
    
    console.log('Data exported to nba-standings-2024-25.json');
    console.log(`Total records: ${data.items.length}`);
}

// Run the crawler
runCrawler().catch(console.error);