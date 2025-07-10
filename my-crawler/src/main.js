import { CheerioCrawler, Dataset } from 'crawlee';
import fs from 'fs';

// Create the crawler
const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: 1,

    async requestHandler({ $, request, log }) {
        log.info(`Processing ${request.url}`);

        const standings = [];

        // First, let's debug what we can find on the page
        log.info('=== DEBUGGING PAGE STRUCTURE ===');
        
        // Check if the expected divs exist
        const eastDiv = $(`#div_confs_standings_E`);
        const westDiv = $(`#div_confs_standings_W`);
        log.info(`Found East div: ${eastDiv.length > 0}`);
        log.info(`Found West div: ${westDiv.length > 0}`);
        
        // Check if the tables exist
        const eastTable = $(`#confs_standings_E`);
        const westTable = $(`#confs_standings_W`);
        log.info(`Found East table: ${eastTable.length > 0}`);
        log.info(`Found West table: ${westTable.length > 0}`);
        
        // Look for any tables on the page
        const allTables = $('table');
        log.info(`Total tables found: ${allTables.length}`);
        
        // List all table IDs
        allTables.each((i, table) => {
            const id = $(table).attr('id');
            const className = $(table).attr('class');
            log.info(`Table ${i}: id="${id}", class="${className}"`);
        });
        
        // Look for divs that might contain standings
        const allDivs = $('div[id*="standings"], div[class*="standings"]');
        log.info(`Found divs with 'standings': ${allDivs.length}`);
        allDivs.each((i, div) => {
            const id = $(div).attr('id');
            const className = $(div).attr('class');
            log.info(`Standings div ${i}: id="${id}", class="${className}"`);
        });

        const conferenceTables = ['E', 'W'];

        conferenceTables.forEach(conf => {
            const conference = conf === 'E' ? 'Eastern' : 'Western';
            log.info(`\n=== Processing ${conference} Conference ===`);
            
            // Try multiple selector approaches
            let table = null;
            
            // Approach 1: Original selector
            table = $(`#confs_standings_${conf}`);
            if (table.length === 0) {
                // Approach 2: Through container div
                table = $(`#div_confs_standings_${conf}`).find('table');
            }
            if (table.length === 0) {
                // Approach 3: Look for table with conference in caption or headers
                table = $('table').filter((i, el) => {
                    const caption = $(el).find('caption').text().toLowerCase();
                    const headers = $(el).find('th').text().toLowerCase();
                    return caption.includes(conference.toLowerCase()) || 
                           caption.includes('conference') ||
                           headers.includes(conference.toLowerCase());
                });
            }
            
            log.info(`Found table for ${conference}: ${table.length > 0}`);
            
            if (table.length === 0) {
                log.warn(`No table found for ${conference} conference`);
                return;
            }

            // Debug table structure
            const tbody = table.find('tbody');
            const rows = tbody.find('tr');
            log.info(`Table has ${rows.length} rows in tbody`);
            
            if (rows.length === 0) {
                // Try without tbody
                const directRows = table.find('tr');
                log.info(`Table has ${directRows.length} direct rows`);
                
                // Use direct rows if tbody is empty
                if (directRows.length > 0) {
                    rows.length = 0;
                    directRows.each((i, row) => {
                        rows[i] = row;
                    });
                    rows.length = directRows.length;
                }
            }

            // Process each row
            rows.each((index, row) => {
                const $row = $(row);
                const cells = $row.find('td');
                const th = $row.find('th');

                log.info(`Row ${index}: ${cells.length} td cells, ${th.length} th cells`);
                
                // Skip header rows or rows without data
                if (cells.length === 0 && th.length === 0) {
                    return;
                }
                
                // Skip if this looks like a header row
                if (th.length > 0 && cells.length === 0) {
                    return;
                }

                let rank = '';
                let teamName = '';
                
                // Try to extract team info from th element
                if (th.length > 0) {
                    const thText = th.text().trim();
                    log.info(`TH text: "${thText}"`);
                    
                    // Look for team link in th
                    const teamLink = th.find('a').first();
                    if (teamLink.length > 0) {
                        teamName = teamLink.text().trim();
                        rank = thText.replace(teamName, '').trim();
                        log.info(`Found team link: "${teamName}", rank: "${rank}"`);
                    } else {
                        // Try to parse rank and team from th text
                        const rankMatch = thText.match(/^(\d+)\s+(.+)$/);
                        if (rankMatch) {
                            rank = rankMatch[1];
                            teamName = rankMatch[2];
                        } else {
                            rank = (index + 1).toString();
                            teamName = thText;
                        }
                        log.info(`Parsed from th: rank="${rank}", team="${teamName}"`);
                    }
                }

                // If we have enough data, create the team record
                if (cells.length >= 3 && teamName) {
                    const teamData = {
                        conference,
                        rank: rank || (index + 1).toString(),
                        team: teamName,
                        wins: cells.length > 0 ? $(cells[0]).text().trim() : '',
                        losses: cells.length > 1 ? $(cells[1]).text().trim() : '',
                        winPct: cells.length > 2 ? $(cells[2]).text().trim() : '',
                        gamesBehind: cells.length > 3 ? $(cells[3]).text().trim() : '',
                        pointsFor: cells.length > 4 ? $(cells[4]).text().trim() : '',
                        pointsAgainst: cells.length > 5 ? $(cells[5]).text().trim() : '',
                        pointsDiff: cells.length > 6 ? $(cells[6]).text().trim() : '',
                    };

                    // Add optional fields if they exist
                    if (cells.length > 7) {
                        teamData.streak = $(cells[7]).text().trim();
                    }
                    if (cells.length > 8) {
                        teamData.lastTen = $(cells[8]).text().trim();
                    }

                    standings.push(teamData);
                    log.info(`Added team: ${teamName} (${conference})`);
                }
            });
        });

        log.info(`Found ${standings.length} teams in standings`);

        // Log first few entries for debugging
        if (standings.length > 0) {
            log.info('Sample data:');
            standings.slice(0, 3).forEach(team => {
                log.info(`${team.conference}: Rank ${team.rank}, Team: ${team.team}, W-L: ${team.wins}-${team.losses}`);
            });
        }

        for (const team of standings) {
            await Dataset.pushData(team);
        }

        await Dataset.pushData({
            type: 'summary',
            totalTeams: standings.length,
            scrapedAt: new Date().toISOString(),
            url: request.url
        });
    },

    failedRequestHandler({ request, error, log }) {
        log.error(`Request ${request.url} failed: ${error.message}`);
    },
});

// Run the crawler
async function runCrawler() {
    console.log('Starting NBA Standings Crawler...');

    await crawler.addRequests([
        'https://www.basketball-reference.com/leagues/NBA_2025_standings.html'
    ]);

    await crawler.run();

    console.log('Crawler finished! Check the storage/datasets/default folder for results.');

    const dataset = await Dataset.open();
    const data = await dataset.getData();

    // Filter out summary records for the JSON export
    const standingsData = data.items.filter(item => item.type !== 'summary');

    // Export as JSON
    // fs.writeFileSync('nba-standings-2024-25.json', JSON.stringify(standingsData, null, 2));

    // Export as CSV
    if (standingsData.length > 0) {
        const csvHeaders = [
            'Conference',
            'Rank',
            'Team',
            'Wins',
            'Losses',
            'Win Percentage',
            'Games Behind',
            'Points For',
            'Points Against',
            'Point Differential',
            'Streak',
            'Last Ten'
        ];

        const csvRows = standingsData.map(team => [
            team.conference,
            team.rank,
            team.team,
            team.wins,
            team.losses,
            team.winPct,
            team.gamesBehind,
            team.pointsFor,
            team.pointsAgainst,
            team.pointsDiff,
            team.streak || '',
            team.lastTen || ''
        ]);

        // Combine headers and data
        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(cell => {
                // Escape cells that contain commas or quotes
                const cellStr = String(cell);
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return `"${cellStr.replace(/"/g, '""')}"`;
                }
                return cellStr;
            }).join(','))
            .join('\n');

        fs.writeFileSync('nba-standings-2024-25.csv', csvContent);
        console.log('Data exported to nba-standings-2024-25.csv');
    }

    console.log('Data exported to nba-standings-2024-25.json');
    console.log(`Total team records: ${standingsData.length}`);
    
    // Show summary
    const summary = data.items.find(item => item.type === 'summary');
    if (summary) {
        console.log(`Scraping completed at: ${summary.scrapedAt}`);
        console.log(`Total teams found: ${summary.totalTeams}`);
    }
}

runCrawler().catch(console.error);