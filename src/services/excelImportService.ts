import * as XLSX from 'xlsx';
import api from '../api/api';

export interface ExcelTeam {
  name: string;
  short_name?: string;
  country?: string;
  group?: string;
  flag_url?: string;
  logo?: string;
  founded?: number;
  venue?: string;
  coach?: string;
}

export interface ExcelMatch {
  homeTeam: string;
  awayTeam: string;
  date: string;
  venue?: string;
  round?: string;
  league?: string;
  season?: string;
  matchType?: 'GROUP' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'FINAL';
  group?: string;
}

export interface ExcelImportResult {
  success: boolean;
  message: string;
  teams?: ExcelTeam[];
  matches?: ExcelMatch[];
  errors?: string[];
}

class ExcelImportService {
  
  /**
   * Läs Excel-fil och returnera data som JSON
   */
  async readExcelFile(file: File): Promise<{ teams: ExcelTeam[], matches: ExcelMatch[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          let teams: ExcelTeam[] = [];
          let matches: ExcelMatch[] = [];
          
          // Kolla om det finns ett "Teams" eller "Lag" sheet
          const teamSheetNames = ['Teams', 'Lag', 'Team'];
          let teamSheetName = teamSheetNames.find(name => workbook.SheetNames.includes(name));
          
          if (teamSheetName) {
            const teamSheet = workbook.Sheets[teamSheetName];
            const teamData = XLSX.utils.sheet_to_json(teamSheet);
            teams = this.parseTeamsFromExcel(teamData);
          }
          
          // Kolla om det finns ett "Matches" eller "Matcher" sheet
          const matchSheetNames = ['Matches', 'Matcher', 'Match', 'Fixtures'];
          let matchSheetName = matchSheetNames.find(name => workbook.SheetNames.includes(name));
          
          if (matchSheetName) {
            const matchSheet = workbook.Sheets[matchSheetName];
            const matchData = XLSX.utils.sheet_to_json(matchSheet);
            matches = this.parseMatchesFromExcel(matchData);
          }
          
          // Om inga specifika sheets hittas, använd första sheetet
          if (teams.length === 0 && matches.length === 0 && workbook.SheetNames.length > 0) {
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const firstSheetData = XLSX.utils.sheet_to_json(firstSheet);
            
            console.log('Excel sheet data:', firstSheetData);
            
            // Försök avgöra om det är lag eller matcher baserat på kolumnnamn
            if (firstSheetData.length > 0) {
              const firstRow = firstSheetData[0] as any;
              const columns = Object.keys(firstRow).map(k => k.toLowerCase());
              
              console.log('Found columns:', columns);
              
              if (columns.includes('hemmalag') || columns.includes('hometeam') || columns.includes('home') || columns.includes('away') || columns.includes('bortalag')) {
                console.log('Detected as matches data');
                matches = this.parseMatchesFromExcel(firstSheetData);
              } else if (columns.includes('team') || columns.includes('lag') || columns.includes('name') || columns.includes('namn')) {
                console.log('Detected as teams data');
                teams = this.parseTeamsFromExcel(firstSheetData);
              }
            }
          }
          
          console.log('Final parsed result:', { teams: teams.length, matches: matches.length });
          
          resolve({ teams, matches });
        } catch (error) {
          reject(new Error(`Fel vid läsning av Excel-fil: ${error instanceof Error ? error.message : 'Okänt fel'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Fel vid läsning av fil'));
      };
      
      reader.readAsBinaryString(file);
    });
  }
  
  /**
   * Parse lag-data från Excel
   */
  private parseTeamsFromExcel(data: any[]): ExcelTeam[] {
    return data.map((row, index) => {
      try {
        // Flexibel mappning av kolumnnamn
        const team: ExcelTeam = {
          name: this.getValueFromRow(row, ['name', 'namn', 'team', 'lag', 'teamname']) || `Lag ${index + 1}`,
          short_name: this.getValueFromRow(row, ['short_name', 'shortname', 'kort_namn', 'förkortning', 'abbreviation']),
          country: this.getValueFromRow(row, ['country', 'land', 'nation', 'nationality']),
          group: this.getValueFromRow(row, ['group', 'grupp', 'pool']),
          flag_url: this.getValueFromRow(row, ['flag_url', 'flag', 'flagga', 'flagg_url']),
          logo: this.getValueFromRow(row, ['logo', 'logga', 'emblem', 'badge']),
          founded: this.parseNumber(this.getValueFromRow(row, ['founded', 'grundat', 'year', 'år'])),
          venue: this.getValueFromRow(row, ['venue', 'stadium', 'hemmaplan', 'arena']),
          coach: this.getValueFromRow(row, ['coach', 'tränare', 'manager', 'trainer'])
        };
        
        return team;
      } catch (error) {
        console.warn(`Fel vid parsing av lagdata på rad ${index + 1}:`, error);
        return {
          name: `Lag ${index + 1}`,
        };
      }
    }).filter(team => team.name && team.name.trim() !== '');
  }
  
  /**
   * Parse match-data från Excel
   */
  private parseMatchesFromExcel(data: any[]): ExcelMatch[] {
    return data.map((row, index) => {
      try {
        const homeTeam = this.getValueFromRow(row, ['hometeam', 'home', 'hemmalag', 'hemma']);
        const awayTeam = this.getValueFromRow(row, ['awayteam', 'away', 'bortalag', 'borta']);
        const rawDate = this.getValueFromRow(row, ['date', 'datum', 'matchdate', 'day']);
        const parsedDate = this.parseDate(rawDate);
        
        const match: ExcelMatch = {
          homeTeam: homeTeam || '',
          awayTeam: awayTeam || '',
          date: parsedDate || '',
          venue: this.getValueFromRow(row, ['venue', 'stadium', 'arena', 'plats']),
          round: this.getValueFromRow(row, ['round', 'omgång', 'runda', 'matchday']),
          league: this.getValueFromRow(row, ['league', 'liga', 'tournament', 'turnering']),
          season: this.getValueFromRow(row, ['season', 'säsong', 'year', 'år']),
          matchType: this.parseMatchType(this.getValueFromRow(row, ['matchtype', 'match_type', 'typ', 'stage', 'fas'])),
          group: this.getValueFromRow(row, ['group', 'grupp', 'pool'])
        };
        
        return match;
      } catch (error) {
        console.warn(`Fel vid parsing av matchdata på rad ${index + 1}:`, error);
        return {
          homeTeam: `Lag A ${index + 1}`,
          awayTeam: `Lag B ${index + 1}`,
          date: new Date().toISOString().split('T')[0],
        };
      }
    }).filter(match => match.homeTeam && match.awayTeam);
  }
  
  /**
   * Hitta värde i rad baserat på flera möjliga kolumnnamn
   */
  private getValueFromRow(row: any, possibleKeys: string[]): string | undefined {
    for (const key of possibleKeys) {
      // Kolla exakt matchning
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return String(row[key]).trim();
      }
      
      // Kolla case-insensitive matchning
      const actualKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
      if (actualKey && row[actualKey] !== undefined && row[actualKey] !== null && row[actualKey] !== '') {
        return String(row[actualKey]).trim();
      }
    }
    return undefined;
  }
  
  /**
   * Parse nummer från sträng
   */
  private parseNumber(value: string | undefined): number | undefined {
    if (!value) return undefined;
    const num = parseInt(String(value));
    return isNaN(num) ? undefined : num;
  }
  
  /**
   * Parse datum från olika format
   */
  private parseDate(value: any): string | undefined {
    if (!value) return undefined;
    
    try {
      // Om värdet redan är ett Date-objekt (från Excel)
      if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }
      
      // Konvertera till sträng om det inte redan är det
      const dateStr = String(value).trim();
      
      // Om det är ett Excel-datum nummer (serienummer)
      if (/^\d+(\.\d+)?$/.test(dateStr)) {
        const excelDate = parseFloat(dateStr);
        
        // Excel datum börjar från 1900-01-01, men Excel har en bug där det räknar 1900 som skottår
        // Så vi behöver justera för detta
        let baseDate: Date;
        if (excelDate >= 60) {
          // Efter 28 feb 1900, justera för Excel's skottårs-bug
          baseDate = new Date(1899, 11, 30); // 30 dec 1899
          const jsDate = new Date(baseDate.getTime() + ((excelDate - 1) * 24 * 60 * 60 * 1000));
          if (!isNaN(jsDate.getTime())) {
            return jsDate.toISOString().split('T')[0];
          }
        } else {
          // Före 28 feb 1900
          baseDate = new Date(1899, 11, 31); // 31 dec 1899
          const jsDate = new Date(baseDate.getTime() + ((excelDate - 1) * 24 * 60 * 60 * 1000));
          if (!isNaN(jsDate.getTime())) {
            return jsDate.toISOString().split('T')[0];
          }
        }
      }
      
      // Kolla om det redan är i YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const testDate = new Date(dateStr + 'T00:00:00');
        if (!isNaN(testDate.getTime())) {
          return dateStr;
        }
      }
      
      // Försök parse svenska datumformat (DD/MM/YYYY, DD-MM-YYYY)
      const ddmmyyyyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
      const ddmmMatch = dateStr.match(ddmmyyyyRegex);
      if (ddmmMatch) {
        const [, day, month, year] = ddmmMatch;
        const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
      
      // Sista utväg - försök med new Date()
      const fallbackDate = new Date(dateStr);
      if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate.toISOString().split('T')[0];
      }
      
      console.warn('Could not parse date:', dateStr);
      return undefined;
    } catch (error) {
      console.error('Error parsing date:', value, error);
      return undefined;
    }
  }
  
  /**
   * Parse matchType från sträng
   */
  private parseMatchType(value: string | undefined): 'GROUP' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'FINAL' | undefined {
    if (!value) return undefined;
    
    const lowerValue = value.toLowerCase().trim();
    
    // Mappa olika match-typer
    if (lowerValue === 'group' || lowerValue === 'grupp' || lowerValue === 'gruppspel') {
      return 'GROUP';
    }
    if (lowerValue === 'round_of_16' || lowerValue === 'åttondel' || lowerValue === 'åttondelsfinal' || lowerValue === '16') {
      return 'ROUND_OF_16';
    }
    if (lowerValue === 'quarter_final' || lowerValue === 'kvart' || lowerValue === 'kvartsfinal' || lowerValue === '8') {
      return 'QUARTER_FINAL';
    }
    if (lowerValue === 'semi_final' || lowerValue === 'semi' || lowerValue === 'semifinal' || lowerValue === '4') {
      return 'SEMI_FINAL';
    }
    if (lowerValue === 'final' || lowerValue === 'final' || lowerValue === '2') {
      return 'FINAL';
    }
    
    // Default till GROUP om inte igenkänt
    return 'GROUP';
  }

  /**
   * Importera lag till databasen
   */
  async importTeamsToDatabase(teams: ExcelTeam[]): Promise<ExcelImportResult> {
    try {
      const response = await api.post('/admin.php?action=import_excel_teams', {
        teams: teams
      });
      
      const result = response.data;
      
      if (result.success) {
        return {
          success: true,
          message: `${teams.length} lag importerades framgångsrikt.`,
          teams: teams
        };
      } else {
        return {
          success: false,
          message: result.message || 'Fel vid import av lag',
          errors: result.errors
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Fel vid import: ${error instanceof Error ? error.message : 'Okänt fel'}`,
        errors: [error instanceof Error ? error.message : 'Okänt fel']
      };
    }
  }
  
  /**
   * Importera matcher till databasen
   */
  async importMatchesToDatabase(matches: ExcelMatch[]): Promise<ExcelImportResult> {
    try {
      const response = await api.post('/admin.php?action=import_excel_matches', {
        matches: matches
      });
      
      const result = response.data;
      
      if (result.success) {
        return {
          success: true,
          message: result.message || `${matches.length} matcher importerades framgångsrikt.`,
          matches: matches,
          errors: result.errors
        };
      } else {
        return {
          success: false,
          message: result.message || 'Fel vid import av matcher',
          errors: result.errors
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Fel vid import: ${error instanceof Error ? error.message : 'Okänt fel'}`,
        errors: [error instanceof Error ? error.message : 'Okänt fel']
      };
    }
  }
  
  /**
   * Generera exempel Excel-fil för nedladdning
   */
  generateExampleFile(type: 'teams' | 'matches'): void {
    let data: any[] = [];
    let filename = '';
    
    if (type === 'teams') {
      data = [
        {
          'Namn': 'England',
          'Kort_namn': 'ENG',
          'Land': 'England',
          'Grupp': 'A',
          'Flagga_url': 'https://flagcdn.com/w320/gb-eng.png'
        },
        {
          'Namn': 'Sverige',
          'Kort_namn': 'SWE', 
          'Land': 'Sweden',
          'Grupp': 'B',
          'Flagga_url': 'https://flagcdn.com/w320/se.png'
        }
      ];
      filename = 'exempel_lag.xlsx';
    } else {
      data = [
        {
          'Hemmalag': 'England',
          'Bortalag': 'Sverige',
          'Datum': '2025-08-15',
          'MatchType': 'GROUP',
          'Grupp': 'A'
        },
        {
          'Hemmalag': 'Tyskland',
          'Bortalag': 'Frankrike',
          'Datum': '2025-08-22',
          'MatchType': 'QUARTER_FINAL'
        }
      ];
      filename = 'exempel_matcher.xlsx';
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type === 'teams' ? 'Lag' : 'Matcher');
    
    XLSX.writeFile(workbook, filename);
  }
}

export const excelImportService = new ExcelImportService();
