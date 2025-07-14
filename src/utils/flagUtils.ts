// Utility för att hämta flagg-URLer baserat på landskoder eller explicit flag_url
// Använder flagcdn.com API för snabba och pålitliga flaggor

export const getFlagUrl = (
    team: { flag_url?: string; name?: string } | string,
    size: 'w20' | 'w40' | 'w80' | 'w160' = 'w40'
): string => {
    // Om explicit flag_url finns, använd den
    if (typeof team === 'object' && team.flag_url) return team.flag_url;
    const teamName = typeof team === 'string' ? team : team.name;
    if (!teamName) return '';
    const countryCode = getCountryCodeFromTeamName(teamName);
    if (!countryCode) return '';
    const code = countryCode.toLowerCase();
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

export const generateFlagUrlForTeam = getFlagUrl;

export default {
    getFlagUrl,
    getCountryCodeFromTeamName,
    generateFlagUrlForTeam
};
