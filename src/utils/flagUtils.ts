// Utility för att hämta flagg-URLer baserat på landskoder eller explicit flag_url
// Använder flagcdn.com API för snabba och pålitliga flaggor

export const getFlagUrl = (
    team: { flag_url?: string; name?: string } | string,
    size: 'w20' | 'w40' | 'w80' | 'w160' = 'w40'
): string => {
    if (!team) return '';
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
        // === EUROPA (engelska) ===
        'Germany': 'de',
        'Scotland': 'gb-sct',
        'Hungary': 'hu',
        'Switzerland': 'ch',
        'Spain': 'es',
        'Croatia': 'hr',
        'Italy': 'it',
        'Albania': 'al',
        'Slovenia': 'si',
        'Denmark': 'dk',
        'Serbia': 'rs',
        'Poland': 'pl',
        'Netherlands': 'nl',
        'Austria': 'at',
        'France': 'fr',
        'Belgium': 'be',
        'Norway': 'no',
        'Sweden': 'se',
        'Iceland': 'is',
        'Slovakia': 'sk',
        'Romania': 'ro',
        'Ukraine': 'ua',
        'Turkey': 'tr',
        'Georgia': 'ge',
        'Portugal': 'pt',
        'Czech Republic': 'cz',
        'Wales': 'gb-wls',
        'Bosnia and Herzegovina': 'ba',
        'Northern Ireland': 'gb-nir',
        'North Macedonia': 'mk',
        'Republic of Ireland': 'ie',
        'Kosovo': 'xk',

        // === EUROPA (svenska) ===
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
        'England': 'gb-eng',
        'Polen': 'pl',
        'Nederländerna': 'nl',
        'Österrike': 'at',
        'Frankrike': 'fr',
        'Belgien': 'be',
        'Norge': 'no',
        'Sverige': 'se',
        'Island': 'is',
        'Finland': 'fi',
        'Slovakien': 'sk',
        'Rumänien': 'ro',
        'Ukraina': 'ua',
        'Turkiet': 'tr',
        'Georgien': 'ge',
        'Tjeckien': 'cz',
        'Bosnien-Hercegovina': 'ba',
        'Nordirland': 'gb-nir',
        'Nordmakedonien': 'mk',
        'Irland': 'ie',

        // === SYDAMERIKA ===
        'Brazil': 'br',
        'Brasilien': 'br',
        'Argentina': 'ar',
        'Uruguay': 'uy',
        'Colombia': 'co',
        'Ecuador': 'ec',
        'Paraguay': 'py',
        'Chile': 'cl',
        'Peru': 'pe',
        'Bolivia': 'bo',
        'Venezuela': 've',

        // === NORDAMERIKA & KARIBIEN ===
        'Mexico': 'mx',
        'Mexiko': 'mx',
        'USA': 'us',
        'Canada': 'ca',
        'Kanada': 'ca',
        'Panama': 'pa',
        'Haiti': 'ht',
        'Jamaica': 'jm',
        'Curaçao': 'cw',
        'Curacao': 'cw',

        // === AFRIKA ===
        'Morocco': 'ma',
        'Marocko': 'ma',
        'Senegal': 'sn',
        'Egypt': 'eg',
        'Egypten': 'eg',
        'Ghana': 'gh',
        'Ivory Coast': 'ci',
        'Elfenbenskusten': 'ci',
        'Algeria': 'dz',
        'Algeriet': 'dz',
        'Tunisia': 'tn',
        'Tunisien': 'tn',
        'South Africa': 'za',
        'Sydafrika': 'za',
        'Cape Verde': 'cv',
        'Kap Verde': 'cv',
        'DR Congo': 'cd',
        'Kongo-Kinshasa': 'cd',
        'Nigeria': 'ng',
        'Cameroon': 'cm',
        'Kamerun': 'cm',

        // === ASIEN ===
        'Japan': 'jp',
        'South Korea': 'kr',
        'Sydkorea': 'kr',
        'Iran': 'ir',
        'Saudi Arabia': 'sa',
        'Saudiarabien': 'sa',
        'Qatar': 'qa',
        'Australia': 'au',
        'Australien': 'au',
        'Uzbekistan': 'uz',
        'Jordan': 'jo',
        'Jordanien': 'jo',
        'Iraq': 'iq',
        'Irak': 'iq',
        'China': 'cn',
        'Kina': 'cn',
        'United Arab Emirates': 'ae',
        'Förenade Arabemiraten': 'ae',

        // === OCEANIEN ===
        'New Zealand': 'nz',
        'Nya Zeeland': 'nz',
        'New Caledonia': 'nc',
        'Nya Kaledonien': 'nc',

        // === PLACEHOLDER FÖR PLAY-OFF LAG ===
        'Play-off UEFA A': '',
        'Play-off UEFA B': '',
        'Play-off UEFA C': '',
        'Play-off UEFA D': '',
        'Play-off AFC/CAF': '',
        'Play-off CONCACAF/OFC': ''
    };

    return teamToCountryCode[teamName] || '';
};

export const generateFlagUrlForTeam = getFlagUrl;

export default {
    getFlagUrl,
    getCountryCodeFromTeamName,
    generateFlagUrlForTeam
};
