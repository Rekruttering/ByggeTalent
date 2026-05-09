export const groupedRoles = {
  "Faglærte og tekniske stillinger (udførende)": [
    "Anlægsstruktør",
    "Bygningsstruktør",
    "Brolægger",
    "Byggemontagetekniker",
    "Kloakmester",
    "Monteringstekniker",
  ],
  "Funktionærer, ledelse og teknisk personale": [
    "Projektleder (byggeri/anlæg)",
    "Byggeleder",
    "Entrepriseleder",
    "Projekteringsleder",
    "Fagchef",
    "Markedschef / forretningsudvikling",
    "Byggetekniker",
    "Byggesagsbehandler",
    "Kvalitetsansvarlig",
    "PQ-ansvarlig",
    "Kalkulatør",
    "Planlægger (tid/plan)",
  ],
  "Rådgivere og projektering": [
    "Bygningsingeniør",
    "Konstruktionsingeniør",
    "Bygningskonstruktør",
    "Arkitekt",
    "Brandrådgiver",
    "Arbejdsmiljøkoordinator (P/B)",
    "Bæredygtighedskonsulent",
    "ESG-ansvarlig",
  ],
  "Installationer og teknik": [
    "Installationsingeniør (VVS/EL)",
    "VVS-projektleder",
    "El-projektleder",
    "Teknikentrepriseleder",
  ],
  "Inspektører og specialister": [
    "Broinspektør",
    "Bygningsinspektør",
    "Jernbaneinspektør",
    "Tilsynsførende",
    "Landinspektør",
    "Geotekniker",
    "Spildevandsingeniør",
  ],
  "Drift og facility": ["Driftsleder", "Facility Manager"],
};

export const groupNames = Object.keys(groupedRoles);

// ─── ALT · Arbejdslivstest ────────────────────────────────────────────────────

export type AltCategory = "Kultur & Tone" | "Hold & Ressourcer" | "Ansvar & Mandat" | "Trivsel";
export type AltOption = { text: string; p: 1 | 2 | 3 };
export type AltQuestion = { cat: AltCategory; q: string; options: [AltOption, AltOption, AltOption] };

export const altQuestionsDB: {
  common: AltQuestion[];
  leder: AltQuestion[];
  medarbejder: AltQuestion[];
  nyuddannet: AltQuestion[];
} = {
  common: [
    {
      cat: "Kultur & Tone",
      q: "Hvordan håndteres fejl i dit nuværende team eller afdeling?",
      options: [
        { text: "Vi ser fejl som fælles læring og justerer processen løbende.", p: 1 },
        { text: "Fokus ligger på at finde årsagen, men tonen kan være spids.", p: 2 },
        { text: "Fejl bliver diskuteret i forhold til personligt ansvar.", p: 3 },
      ],
    },
    {
      cat: "Kultur & Tone",
      q: "Oplever du, at der er psykologisk tryghed, hvor du kan sige din mening?",
      options: [
        { text: "Ja, altid. Vi lytter til hinanden uanset hierarki.", p: 1 },
        { text: "For det meste, men visse emner er svære at tage op.", p: 2 },
        { text: "Nej, man passer mest på sig selv.", p: 3 },
      ],
    },
    {
      cat: "Hold & Ressourcer",
      q: "Føler du, at dit team har de nødvendige kompetencer til opgaverne?",
      options: [
        { text: "Ja, vi komplementerer hinanden rigtig godt.", p: 1 },
        { text: "Vi klarer den, men vi mangler ofte specifik viden.", p: 2 },
        { text: "Vi er underbemandede eller mangler kritiske kompetencer.", p: 3 },
      ],
    },
    {
      cat: "Hold & Ressourcer",
      q: "Er der tydelighed omkring hvem der gør hvad i jeres projekter?",
      options: [
        { text: "Ja, ansvarsfordelingen er krystalklar.", p: 1 },
        { text: "Nogenlunde, men vi løber ind i gråzoner.", p: 2 },
        { text: "Ofte hersker der tvivl om leverancerne.", p: 3 },
      ],
    },
    {
      cat: "Trivsel",
      q: "Hvordan vil du beskrive dit energiniveau efter en arbejdsdag?",
      options: [
        { text: "Jeg føler mig brugt på en god måde og har overskud.", p: 1 },
        { text: "Jeg er ofte træt og bruger aftenen på at lade op.", p: 2 },
        { text: "Jeg er mentalt drænet og kan ikke slippe tankerne.", p: 3 },
      ],
    },
    {
      cat: "Trivsel",
      q: "Hvor ofte føler du dig presset af tidsplaner og deadlines?",
      options: [
        { text: "Det er en del af gamet, men det føles kontrollerbart.", p: 1 },
        { text: "Jævnligt — det går ud over kvaliteten engang imellem.", p: 2 },
        { text: "Konstant, det føles som om vi altid er bagud.", p: 3 },
      ],
    },
    {
      cat: "Trivsel",
      q: "Føler du, at dit arbejde giver mening for dig personligt?",
      options: [
        { text: "Ja, jeg er stolt af det vi bygger.", p: 1 },
        { text: "Ja, for det meste, men administrativt bøvl fylder meget.", p: 2 },
        { text: "Nej, det føles mest som brandslukning.", p: 3 },
      ],
    },
  ],

  leder: [
    {
      cat: "Ansvar & Mandat",
      q: "Oplever du, at dit mandat (beslutningskraft) følger dit ansvar?",
      options: [
        { text: "Ja, jeg har de beføjelser, jeg skal bruge.", p: 1 },
        { text: "Delvist, men jeg skal ofte højere op for godkendelse.", p: 2 },
        { text: "Nej, jeg har ansvaret, men ikke magten.", p: 3 },
      ],
    },
    {
      cat: "Ansvar & Mandat",
      q: "Hvor meget fylder politisk spil i din hverdag?",
      options: [
        { text: "Minimalt — vi fokuserer på driften.", p: 1 },
        { text: "En del — det kræver energi at navigere i.", p: 2 },
        { text: "Alt for meget, det forstyrrer mine resultater.", p: 3 },
      ],
    },
    {
      cat: "Hold & Ressourcer",
      q: "Har du de ressourcer (økonomi/folk), du skal bruge til dine mål?",
      options: [
        { text: "Ja, rammerne er realistiske.", p: 1 },
        { text: "Det er stramt, men vi får det til at ske.", p: 2 },
        { text: "Nej, målene er urealistiske ift. ressourcerne.", p: 3 },
      ],
    },
    {
      cat: "Kultur & Tone",
      q: "Føler du dig bakket op af din egen ledelse?",
      options: [
        { text: "Ja, de har min ryg når det brænder på.", p: 1 },
        { text: "Som regel, men jeg kan føle mig alene i svære valg.", p: 2 },
        { text: "Nej, jeg føler mig ofte udstillet.", p: 3 },
      ],
    },
  ],

  medarbejder: [
    {
      cat: "Ansvar & Mandat",
      q: "I hvilken grad påtager du dig opgaver uden for din rolle?",
      options: [
        { text: "Sjældent — mine opgaver er klare.", p: 1 },
        { text: "Ofte, jeg træder til for at få tingene til at glide.", p: 2 },
        { text: "Konstant, jeg varetager funktioner jeg ikke er ansat til.", p: 3 },
      ],
    },
    {
      cat: "Ansvar & Mandat",
      q: "Har du indflydelse på, hvordan du planlægger din egen dag?",
      options: [
        { text: "Høj grad af frihed under ansvar.", p: 1 },
        { text: "Nogen grad, men meget er fastlagt udefra.", p: 2 },
        { text: "Ingen — min dag styres 100% af andre.", p: 3 },
      ],
    },
    {
      cat: "Kultur & Tone",
      q: "Bliver dine faglige input hørt af ledelsen?",
      options: [
        { text: "Ja, de værdsætter min ekspertise.", p: 1 },
        { text: "De lytter, men det ændrer sjældent noget.", p: 2 },
        { text: "Nej, beslutninger tages over hovedet på os.", p: 3 },
      ],
    },
    {
      cat: "Hold & Ressourcer",
      q: "Fungerer samarbejdet mellem de forskellige faggrupper?",
      options: [
        { text: "Ja, vi arbejder mod samme mål.", p: 1 },
        { text: "Der er en del kassetænkning, men det går.", p: 2 },
        { text: "Nej, der er mange konflikter mellem faggrupperne.", p: 3 },
      ],
    },
  ],

  nyuddannet: [
    {
      cat: "Hold & Ressourcer",
      q: "Hvordan oplever du overgangen fra uddannelsen til virkeligheden?",
      options: [
        { text: "Jeg får god vejledning og føler mig tryg.", p: 1 },
        { text: "Det er overvældende, men jeg lærer hurtigt.", p: 2 },
        { text: "Jeg føler mig kastet for løverne uden støtte.", p: 3 },
      ],
    },
    {
      cat: "Trivsel",
      q: "Hvilken feedback får du fra erfarne kolleger?",
      options: [
        { text: "Den er anerkendende og lærerig.", p: 1 },
        { text: "Den er mest fokuseret på fejlretning.", p: 2 },
        { text: "Jeg får næsten ingen feedback.", p: 3 },
      ],
    },
    {
      cat: "Ansvar & Mandat",
      q: "Er du bange for at lave fejl i dit daglige arbejde?",
      options: [
        { text: "Nej, jeg ved det er en del af læringen.", p: 1 },
        { text: "Lidt — jeg dobbelttjekker alt mange gange.", p: 2 },
        { text: "Ja, jeg er bange for konsekvenserne.", p: 3 },
      ],
    },
    {
      cat: "Kultur & Tone",
      q: "Føler du dig som en del af fællesskabet på pladsen eller kontoret?",
      options: [
        { text: "Ja, jeg er blevet taget rigtig godt imod.", p: 1 },
        { text: "Ja, men det tager tid at forstå jargonen.", p: 2 },
        { text: "Nej, jeg føler mig udenfor.", p: 3 },
      ],
    },
  ],
};
