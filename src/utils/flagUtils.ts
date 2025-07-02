// Utility för att hämta flagg-URLer baserat på landskoder
// Använder flagcdn.com API för snabba och pålitliga flaggor

export const getFlagUrl = (countryCode: string, size: 'w20' | 'w40' | 'w80' | 'w160' = 'w40'): string => {
    if (!countryCode) return '';
    
    // Formatera landskoden till rätt format (lowercase, 2 tecken)
    const code = countryCode.toLowerCase().slice(0, 2);
    
    // Använd flagcdn.com för bästa kvalitet och hastighet
    return `https://flagcdn.com/${size}/${code}.png`;
};

export const getCountryCodeFromTeamName = (teamName: string): string => {
    // Mappning av lagnamn till ISO 3166-1 alpha-2 landskoder
    const teamToCountryCode: Record<string, string> = {

        'Germany': 'de',
        'Scotland': 'gb-sct', // Skottland har egen flagga
        'Hungary': 'hu',
        'Switzerland': 'ch',

        'Spain': 'es',
        'Croatia': 'hr',
        'Italy': 'it',
        'Albania': 'al',

        'Slovenia': 'si',
        'Denmark': 'dk',
        'Serbia': 'rs',
        'England': 'gb-eng', // England har egen flagga

        'Poland': 'pl',
        'Netherlands': 'nl',
        'Austria': 'at',
        'France': 'fr',

        'Belgium': 'be',
        'Norge': 'no',
        'Sverige': 'se',
        'Island': 'is',
        'Finland': 'fi',
        'Slovakia': 'sk',
        'Romania': 'ro',
        'Ukraine': 'ua',

        'Turkey': 'tr',
        'Georgia': 'ge',
        'Portugal': 'pt',
        'Czech Republic': 'cz',
        'Wales': 'gb-wls',
          // Vanliga översättningar
        'Tyskland': 'de',
        'Skottland': 'gb-sct',
        'Ungern': 'hu',
        'Schweiz': 'ch',
        'Spanien': 'es',
        'Kroatien': 'hr',
        'Italien': 'it',
        'Albanien': 'al',
        'Slovenien': 'si',
        'Danmark': 'dk',
        'Serbien': 'rs',
        'Polen': 'pl',
        'Nederländerna': 'nl',
        'Österrike': 'at',
        'Frankrike': 'fr',
        'Belgien': 'be',
        'Slovakien': 'sk',
        'Rumänien': 'ro',
        'Ukraina': 'ua',
        'Turkiet': 'tr',
        'Georgien': 'ge',
        'Tjeckien': 'cz'
    };
    
    return teamToCountryCode[teamName] || '';
};

export const generateFlagUrlForTeam = (teamName: string, size: 'w20' | 'w40' | 'w80' | 'w160' = 'w40'): string => {
    const countryCode = getCountryCodeFromTeamName(teamName);
    return countryCode ? getFlagUrl(countryCode, size) : '';
};

// Backup flagg-URLer för när API:et inte fungerar
export const getBackupFlagUrl = (teamName: string): string => {
    const baseUrl = 'https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/png100px';
    const countryCode = getCountryCodeFromTeamName(teamName);
    
    if (!countryCode) return '';
    
    // Hantera speciella fall för England och Skottland
    if (countryCode === 'gb-eng') {
        return `${baseUrl}/gb.png`; // Använd Storbritannien som backup för England
    }
    if (countryCode === 'gb-sct') {
        return `${baseUrl}/gb.png`; // Använd Storbritannien som backup för Skottland
    }
    
    return `${baseUrl}/${countryCode}.png`;
};

// Hämta flagg-URL för ett team, prioriterar flag_url om den finns
export const getTeamFlagUrl = (team: { flag_url?: string; flag?: string; name?: string } | undefined): string => {
    if (!team) return '';
    
    // Försök med befintlig flag_url först
    const existingFlag = team.flag_url || team.flag;
    if (existingFlag) return existingFlag;
    
    // Fallback: generera flagg-URL baserat på lagnamn
    if (team.name) {
        return generateFlagUrlForTeam(team.name);
    }
    
    return '';
};

// Hämta flagg-URL för ett lagnamn, kolla mot alla teams om det finns custom flag_url
export const getTeamFlagUrlByName = (teamName: string, allTeams?: { flag_url?: string; flag?: string; name?: string }[]): string => {
    if (!teamName) return '';
    
    // Om vi har en lista med alla teams, kolla om något matchar namnet och har custom flag_url
    if (allTeams) {
        const team = allTeams.find(t => t.name === teamName);
        if (team) {
            return getTeamFlagUrl(team);
        }
    }
    
    // Fallback: generera flagg-URL baserat på lagnamn
    return generateFlagUrlForTeam(teamName);
};

export default {
    getFlagUrl,
    getCountryCodeFromTeamName,
    generateFlagUrlForTeam,
    getBackupFlagUrl,
    getTeamFlagUrl,
    getTeamFlagUrlByName
};
