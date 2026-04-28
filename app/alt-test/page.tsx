"use client";

import { useState } from "react";

const NAVY = "#0A1628";
const NAVY_MED = "#152338";
const CURRY = "#C4A03A";
const WHITE = "#FFFFFF";
const PAGE_BG = "#F0ECE5";
const TEXT = "#0A1628";
const MUTED = "#6B7A8A";
const BORDER = "rgba(10,22,40,0.09)";

type Role = "leder" | "medarbejder" | "nyuddannet";
type Category = "Kultur & Tone" | "Hold & Ressourcer" | "Ansvar & Mandat" | "Trivsel";

interface Question {
  cat: Category;
  q: string;
  options: { text: string; p: number }[];
}

const questionsDB: { common: Question[]; leder: Question[]; medarbejder: Question[]; nyuddannet: Question[] } = {
  common: [
    // Kultur & Tone
    { cat: "Kultur & Tone", q: "Hvordan håndteres fejl i dit nuværende team eller afdeling?", options: [{ text: "Vi ser fejl som fælles læring og justerer processen løbende.", p: 1 }, { text: "Fokus ligger på at finde årsagen, men tonen kan være spids.", p: 2 }, { text: "Fejl bliver ofte diskuteret i forhold til personligt ansvar.", p: 3 }] },
    { cat: "Kultur & Tone", q: "Oplever du, at der er en psykologisk tryghed, hvor du kan sige din mening?", options: [{ text: "Ja, altid — vi lytter til hinanden uanset hierarki.", p: 1 }, { text: "For det meste, men visse emner er svære at tage op.", p: 2 }, { text: "Nej, man passer mest på sig selv.", p: 3 }] },
    { cat: "Kultur & Tone", q: "Hvad kendetegner kommunikationen på din arbejdsplads til daglig?", options: [{ text: "Direkte, respektfuld og konstruktiv.", p: 1 }, { text: "Uformel og varierende — afhænger meget af hvem du taler med.", p: 2 }, { text: "Hård i kanten eller præget af sladder og frustration.", p: 3 }] },
    { cat: "Kultur & Tone", q: "Hvordan er tonen, når der er pres på — fx op mod deadlines eller ved uforudsete problemer?", options: [{ text: "Vi holder fast i en professionel og løsningsorienteret tilgang.", p: 1 }, { text: "Det er mere anspændt, men vi finder vej igennem.", p: 2 }, { text: "Tonen bliver hård og skylden flyttes hurtigt.", p: 3 }] },
    { cat: "Kultur & Tone", q: "I hvilken grad mødes folk med forskellig erfaring og baggrund med respekt i dit team?", options: [{ text: "Erfaring og diversitet ses som en styrke — alle tæller.", p: 1 }, { text: "De fleste respekteres, men der er usagte hierarkier.", p: 2 }, { text: "Det mærkes tydeligt hvem der har høj og lav status.", p: 3 }] },
    // Hold & Ressourcer
    { cat: "Hold & Ressourcer", q: "Føler du, at dit team har de nødvendige kompetencer til opgaverne?", options: [{ text: "Ja, vi komplementerer hinanden rigtig godt.", p: 1 }, { text: "Vi klarer den, men vi mangler ofte specifik viden.", p: 2 }, { text: "Vi er underbemandede eller mangler kritiske kompetencer.", p: 3 }] },
    { cat: "Hold & Ressourcer", q: "Er der tydelighed omkring hvem der gør hvad i jeres projekter?", options: [{ text: "Ja, ansvarsfordelingen er krystalklar.", p: 1 }, { text: "Nogenlunde, men vi løber ind i gråzoner.", p: 2 }, { text: "Ofte hersker der tvivl om, hvem der ejer hvad.", p: 3 }] },
    { cat: "Hold & Ressourcer", q: "Oplever du, at arbejdsbyrden er fornuftigt fordelt i teamet?", options: [{ text: "Ja, det er ret balanceret og vi justerer løbende.", p: 1 }, { text: "Nogenlunde, men nogle bærer mere end andre.", p: 2 }, { text: "Nej, der er en tydelig skævfordeling som ingen tager fat på.", p: 3 }] },
    { cat: "Hold & Ressourcer", q: "Har du adgang til de informationer du har brug for for at løse dine opgaver?", options: [{ text: "Ja, informationsdeling fungerer godt.", p: 1 }, { text: "Delvist — jeg bruger tid på at jage svar.", p: 2 }, { text: "Nej, vigtig information sidder hos enkeltpersoner eller fanges sent.", p: 3 }] },
    { cat: "Hold & Ressourcer", q: "Fungerer koordineringen med andre faggrupper eller afdelinger i praksis?", options: [{ text: "Ja, vi arbejder effektivt på tværs.", p: 1 }, { text: "Det halter lidt — der er snitflader der ikke er klare nok.", p: 2 }, { text: "Nej, der er meget gnidning og spildtid i grænsefladen.", p: 3 }] },
    // Ansvar & Mandat
    { cat: "Ansvar & Mandat", q: "Er dine ansvarsområder og opgaver klart defineret?", options: [{ text: "Ja, jeg ved præcis hvad jeg ejer og hvad der forventes.", p: 1 }, { text: "For det meste — men der er gråzoner der kan skabe forvirring.", p: 2 }, { text: "Nej, mit ansvar er uklart og skifter løbende.", p: 3 }] },
    { cat: "Ansvar & Mandat", q: "Har du det råderum du har brug for til at løse dine opgaver på din måde?", options: [{ text: "Ja, der er frihed under ansvar.", p: 1 }, { text: "Delvist — der er rammer, men de er stramme.", p: 2 }, { text: "Nej, detailstyring begrænser min handlekraft.", p: 3 }] },
    { cat: "Ansvar & Mandat", q: "Oplever du, at forventningerne til dig er realistiske i hverdagen?", options: [{ text: "Ja, det er ambitiøst men opnåeligt.", p: 1 }, { text: "Delvist — der er perioder hvor det er urealistisk.", p: 2 }, { text: "Nej, forventningerne er systematisk for høje.", p: 3 }] },
    { cat: "Ansvar & Mandat", q: "Er der sammenhæng mellem de opgaver du løser og det overordnede formål med dit arbejde?", options: [{ text: "Ja, jeg kan se den røde tråd tydeligt.", p: 1 }, { text: "Delvist — nogle opgaver føles løsrevet fra helheden.", p: 2 }, { text: "Nej, mange opgaver føles formålsløse eller tilfældige.", p: 3 }] },
    { cat: "Ansvar & Mandat", q: "Hvordan oplever du beslutningsprocesserne i din hverdag?", options: [{ text: "Hurtige og klare — vi handler effektivt.", p: 1 }, { text: "Langsomme, men de lander til sidst.", p: 2 }, { text: "Uigennemsigtige eller præget af magtkampe.", p: 3 }] },
    // Trivsel
    { cat: "Trivsel", q: "Hvordan vil du beskrive dit energiniveau efter en arbejdsdag?", options: [{ text: "Jeg føler mig brugt på en god måde og har overskud.", p: 1 }, { text: "Jeg er ofte træt og skal bruge aftenen på at lade op.", p: 2 }, { text: "Jeg er mentalt drænet og kan ikke slippe tankerne.", p: 3 }] },
    { cat: "Trivsel", q: "Hvor ofte føler du dig presset af tidsplaner og deadlines?", options: [{ text: "Det er en del af gamet, men det føles kontrollerbart.", p: 1 }, { text: "Jævnligt — det går ud over kvaliteten engang imellem.", p: 2 }, { text: "Konstant — det føles som om vi altid er bagud.", p: 3 }] },
    { cat: "Trivsel", q: "Føler du, at dit arbejde giver mening for dig personligt?", options: [{ text: "Ja, jeg er stolt af det vi bygger og bidrager til.", p: 1 }, { text: "Ja for det meste, men administrativt bøvl fylder meget.", p: 2 }, { text: "Nej, det føles mest som brandslukning.", p: 3 }] },
    { cat: "Trivsel", q: "Hvordan er din oplevelse af balancen mellem arbejde og fritid?", options: [{ text: "God — jeg slukker relativt let og har tid til det der betyder noget.", p: 1 }, { text: "Det varierer — i perioder æder arbejdet det hele.", p: 2 }, { text: "Arbejdet fylder systematisk for meget og det mærker jeg på kroppen.", p: 3 }] },
    { cat: "Trivsel", q: "I hvilken grad kan du slippe tankerne om arbejde, når du har fri?", options: [{ text: "Det lykkes det meste af tiden.", p: 1 }, { text: "Jeg er mentalt på arbejde om aftenen eller i weekenden.", p: 2 }, { text: "Jeg kan sjældent slippe det — det følger mig hele tiden.", p: 3 }] },
  ],
  leder: [
    // Kultur & Tone
    { cat: "Kultur & Tone", q: "Føler du dig bakket op af din egen ledelse?", options: [{ text: "Ja, de har min ryg når det brænder på.", p: 1 }, { text: "Som regel, men jeg kan føle mig alene i svære valg.", p: 2 }, { text: "Nej, jeg føler mig ofte alene eller udstillet.", p: 3 }] },
    { cat: "Kultur & Tone", q: "Er der overensstemmelse mellem den kultur I siger I vil have, og den I faktisk praktiserer?", options: [{ text: "Ja, vores værdier lever i hverdagen.", p: 1 }, { text: "Der er et gab, men vi arbejder på det.", p: 2 }, { text: "Nej, det er to forskellige verdener.", p: 3 }] },
    { cat: "Kultur & Tone", q: "Oplever du, at din feedback til teamet lander konstruktivt?", options: [{ text: "Ja, det skaber bevægelse og læring.", p: 1 }, { text: "Delvist — det afhænger meget af personen og situationen.", p: 2 }, { text: "Nej, feedback udløser forsvar eller ignoreres.", p: 3 }] },
    // Hold & Ressourcer
    { cat: "Hold & Ressourcer", q: "Har du de ressourcer (økonomi og folk), du skal bruge til dine mål?", options: [{ text: "Ja, rammerne er realistiske.", p: 1 }, { text: "Det er stramt, men vi får det til at ske.", p: 2 }, { text: "Nej, målene er urealistiske ift. ressourcerne.", p: 3 }] },
    { cat: "Hold & Ressourcer", q: "Oplever du, at du har det rigtige team til de opgaver I er sat til at løfte?", options: [{ text: "Ja, teamet matcher opgaverne godt.", p: 1 }, { text: "Nogenlunde — der er huller vi dækker med vilje.", p: 2 }, { text: "Nej, der er et tydeligt mismatch.", p: 3 }] },
    { cat: "Hold & Ressourcer", q: "Er du i stand til at hjælpe dit team med at fjerne forhindringer i hverdagen?", options: [{ text: "Ja, det er en central del af min lederrolle.", p: 1 }, { text: "Delvist — jeg løser nogle, men andre sidder fast i systemet.", p: 2 }, { text: "Nej, jeg er selv fanget i systemet og kan ikke rydde vejen.", p: 3 }] },
    // Ansvar & Mandat
    { cat: "Ansvar & Mandat", q: "Oplever du, at dit mandat følger dit ansvar?", options: [{ text: "Ja, jeg har de beføjelser jeg skal bruge.", p: 1 }, { text: "Delvist — jeg skal ofte højere op for godkendelse.", p: 2 }, { text: "Nej, jeg har ansvaret, men ikke beslutningskraften.", p: 3 }] },
    { cat: "Ansvar & Mandat", q: "Hvor meget fylder politisk navigation og intern positionering i din hverdag?", options: [{ text: "Minimalt — vi fokuserer på driften og resultater.", p: 1 }, { text: "En del — det kræver energi at navigere i.", p: 2 }, { text: "Alt for meget — det forstyrrer mit fokus og mine resultater.", p: 3 }] },
    { cat: "Ansvar & Mandat", q: "Har du tilstrækkelig tydelighed om, hvad der forventes af dig som leder?", options: [{ text: "Ja, mine succeskriterier er klare.", p: 1 }, { text: "Nogenlunde — men der er fortolkningsrum der skaber usikkerhed.", p: 2 }, { text: "Nej, forventningerne er uklare eller skifter.", p: 3 }] },
    // Trivsel
    { cat: "Trivsel", q: "Har du nogen at tale med om de svære lederskabssituationer?", options: [{ text: "Ja — kolleger, netværk eller sparringspartnere.", p: 1 }, { text: "Af og til, men det er ikke en fast struktur.", p: 2 }, { text: "Nej, det er en ensom rolle i den forstand.", p: 3 }] },
    { cat: "Trivsel", q: "Er der perioder, hvor lederrollen kræver mere end du kan give?", options: [{ text: "Sjældent — jeg mærker det er bæredygtigt.", p: 1 }, { text: "Ja, i travle perioder presser det sig.", p: 2 }, { text: "Konstant — jeg kører på reserve.", p: 3 }] },
    { cat: "Trivsel", q: "Giver din lederrolle dig energi?", options: [{ text: "Ja, lederskabet er det jeg er her for.", p: 1 }, { text: "Delvist — der er elementer der slider og elementer der giver.", p: 2 }, { text: "Nej, rollen dræner mere end den giver.", p: 3 }] },
  ],
  medarbejder: [
    // Kultur & Tone
    { cat: "Kultur & Tone", q: "Bliver dine faglige input hørt af ledelsen?", options: [{ text: "Ja, de værdsætter min ekspertise.", p: 1 }, { text: "De lytter, men det ændrer sjældent noget.", p: 2 }, { text: "Nej, beslutninger tages over hovedet på os.", p: 3 }] },
    { cat: "Kultur & Tone", q: "Føler du, at du kan komme med kritik eller bekymringer uden negative konsekvenser?", options: [{ text: "Ja, åben dialog er normen.", p: 1 }, { text: "I nogen grad — men det kræver timing og takt.", p: 2 }, { text: "Nej, det er forbundet med risiko.", p: 3 }] },
    { cat: "Kultur & Tone", q: "Oplever du, at der er plads til din personlige arbejdsstil?", options: [{ text: "Ja, vi har frihed til at løse opgaverne på vores måde.", p: 1 }, { text: "Delvist — der er normer der begrænser det lidt.", p: 2 }, { text: "Nej, der er en rigtig og en forkert måde at gøre tingene på.", p: 3 }] },
    // Hold & Ressourcer
    { cat: "Hold & Ressourcer", q: "Fungerer samarbejdet på tværs af faggrupper eller organisatoriske led?", options: [{ text: "Ja, vi arbejder mod samme mål.", p: 1 }, { text: "Der er kassetænkning, men det fungerer nogenlunde.", p: 2 }, { text: "Nej, der er mange konflikter og megen spildtid.", p: 3 }] },
    { cat: "Hold & Ressourcer", q: "Bliver din faglighed respekteret og brugt korrekt i de opgaver du sættes på?", options: [{ text: "Ja, mine kompetencer matcher opgaverne.", p: 1 }, { text: "Delvist — jeg bruges bredt, men ikke altid optimalt.", p: 2 }, { text: "Nej, mine kompetencer udnyttes ikke eller misforstås.", p: 3 }] },
    { cat: "Hold & Ressourcer", q: "Er du involveret i de beslutninger, der direkte påvirker dit daglige arbejde?", options: [{ text: "Ja, vi har god indflydelse på beslutninger der vedrører os.", p: 1 }, { text: "Af og til, men det varierer meget.", p: 2 }, { text: "Nej, beslutninger tages uden input fra dem det berører.", p: 3 }] },
    // Ansvar & Mandat
    { cat: "Ansvar & Mandat", q: "I hvilken grad oplever du at påtage dig opgaver uden for din rolle?", options: [{ text: "Sjældent — mine opgaver er klare.", p: 1 }, { text: "Ofte — jeg træder til for at få tingene til at glide.", p: 2 }, { text: "Konstant — jeg varetager funktioner jeg ikke er ansat til.", p: 3 }] },
    { cat: "Ansvar & Mandat", q: "Har du indflydelse på, hvordan du planlægger din egen arbejdsdag?", options: [{ text: "Høj grad af frihed under ansvar.", p: 1 }, { text: "Nogen grad, men meget er fastlagt udefra.", p: 2 }, { text: "Ingen — min dag styres 100% af andre.", p: 3 }] },
    { cat: "Ansvar & Mandat", q: "Føler du dig tryg ved at sige til og fra, når din opgavestak vokser?", options: [{ text: "Ja, det er accepteret at prioritere åbent.", p: 1 }, { text: "Delvist — det kræver mod at sige fra.", p: 2 }, { text: "Nej, det forventes at man bare tager det.", p: 3 }] },
    // Trivsel
    { cat: "Trivsel", q: "Har du tid til at udføre dit arbejde med den kvalitet du selv ønsker?", options: [{ text: "Ja, tempoet giver plads til at gøre tingene ordentligt.", p: 1 }, { text: "Af og til — det afhænger af perioden.", p: 2 }, { text: "Nej, tempoet betyder at kvaliteten lider.", p: 3 }] },
    { cat: "Trivsel", q: "Oplever du, at din indsats bliver bemærket og anerkendt?", options: [{ text: "Ja, der er en kultur for at se og anerkende hinanden.", p: 1 }, { text: "Af og til, men det er ikke systematisk.", p: 2 }, { text: "Nej, min indsats forsvinder i mængden.", p: 3 }] },
    { cat: "Trivsel", q: "Er der nogen på din arbejdsplads du kan tale åbent med, hvis noget er svært?", options: [{ text: "Ja, der er tillid og rum til de svære samtaler.", p: 1 }, { text: "Med en eller to — men ikke bredt.", p: 2 }, { text: "Nej, det er en arbejdsplads man holder privat.", p: 3 }] },
  ],
  nyuddannet: [
    // Kultur & Tone
    { cat: "Kultur & Tone", q: "Føler du dig som en del af fællesskabet i skurvognen eller på kontoret?", options: [{ text: "Ja, jeg er blevet taget rigtig godt imod.", p: 1 }, { text: "Ja, men det tager tid at forstå jargonen og koderne.", p: 2 }, { text: "Nej, jeg føler mig stadig som en udenfor.", p: 3 }] },
    { cat: "Kultur & Tone", q: "Oplever du en åben og inkluderende tone på din arbejdsplads?", options: [{ text: "Ja, der er plads til dem der er nye og lærer.", p: 1 }, { text: "Delvist — der er nogen der hjælper og nogen der ikke gør.", p: 2 }, { text: "Nej, den kan være hård, og man forventes at klare sig selv.", p: 3 }] },
    { cat: "Kultur & Tone", q: "Føler du dig tryg ved at stille spørgsmål — også dem du er bange for er 'dumme'?", options: [{ text: "Ja, der er rum til at lære uden at miste ansigt.", p: 1 }, { text: "Delvist — jeg sorterer spørgsmål fra ud fra hvem jeg spørger.", p: 2 }, { text: "Nej, jeg er bange for at fremstå inkompetent.", p: 3 }] },
    // Hold & Ressourcer
    { cat: "Hold & Ressourcer", q: "Hvordan oplever du overgangen fra uddannelsen til virkeligheden i branchen?", options: [{ text: "Jeg får god vejledning og føler mig tryg.", p: 1 }, { text: "Det er overvældende, men jeg lærer hurtigt.", p: 2 }, { text: "Jeg føler mig kastet for løverne uden tilstrækkelig støtte.", p: 3 }] },
    { cat: "Hold & Ressourcer", q: "Har du en klar kontaktperson eller mentor du kan gå til med spørgsmål?", options: [{ text: "Ja, og det gør en stor forskel.", p: 1 }, { text: "Der er nogen, men strukturen er uformel.", p: 2 }, { text: "Nej, jeg finder ud af det meste selv.", p: 3 }] },
    { cat: "Hold & Ressourcer", q: "Er introduktionen til systemer, processer og fagterminologi tilstrækkelig?", options: [{ text: "Ja, onboardingen har dækket det vigtigste.", p: 1 }, { text: "Delvist — der er huller jeg løbende opdager.", p: 2 }, { text: "Nej, jeg føler mig stadig meget usikker på det grundlæggende.", p: 3 }] },
    // Ansvar & Mandat
    { cat: "Ansvar & Mandat", q: "Er du bange for at lave fejl i dit daglige arbejde?", options: [{ text: "Nej, jeg ved det er en del af læringen.", p: 1 }, { text: "Lidt — jeg dobbelttjekker meget for at være sikker.", p: 2 }, { text: "Ja, jeg er tydeligt bange for konsekvenserne.", p: 3 }] },
    { cat: "Ansvar & Mandat", q: "Er de opgaver du får passende i forhold til dit erfaringsniveau?", options: [{ text: "Ja, de er udfordrende og læringsrige uden at være overvældende.", p: 1 }, { text: "Af og til er de for store, men det er ok.", p: 2 }, { text: "Nej, jeg sættes på opgaver jeg ikke er klar til.", p: 3 }] },
    { cat: "Ansvar & Mandat", q: "Oplever du, at du hurtigt er nødt til at arbejde meget selvstændigt?", options: [{ text: "Nej, jeg har støtte og kan bygge det op gradvist.", p: 1 }, { text: "Af og til, men det er ok med den støtte jeg har.", p: 2 }, { text: "Ja, ansvaret kommer hurtigere end min kompetence.", p: 3 }] },
    // Trivsel
    { cat: "Trivsel", q: "Hvilken betydning har feedback fra erfarne kolleger for dig?", options: [{ text: "Den er anerkendende og hjælper mig til at vokse.", p: 1 }, { text: "Den er mest fejlrettende, men det er ok.", p: 2 }, { text: "Jeg får næsten ingen feedback og savner det.", p: 3 }] },
    { cat: "Trivsel", q: "Føler du, at din læring sker i et tempo du kan følge?", options: [{ text: "Ja, det er udfordrende men overkommeligt.", p: 1 }, { text: "Det er lidt hurtigt, men jeg hænger ved.", p: 2 }, { text: "Nej, det går for stærkt og jeg føler mig bagefter.", p: 3 }] },
    { cat: "Trivsel", q: "Har du nogen at tale med, hvis noget på jobbet bliver svært?", options: [{ text: "Ja, jeg har tillid til nogen jeg kan gå til.", p: 1 }, { text: "En enkelt — men ikke nogen struktureret støtte.", p: 2 }, { text: "Nej, jeg håndterer det alene.", p: 3 }] },
  ],
};

const CATEGORIES: Category[] = ["Kultur & Tone", "Hold & Ressourcer", "Ansvar & Mandat", "Trivsel"];

type Dimension = "role_fit" | "collaboration_friction" | "work_pace_mismatch" | "social_energy_mismatch";

const DIMENSIONS: Dimension[] = ["role_fit", "collaboration_friction", "work_pace_mismatch", "social_energy_mismatch"];

const dimensionMapping: Record<Category, Dimension[]> = {
  "Ansvar & Mandat":    ["role_fit"],
  "Kultur & Tone":      ["collaboration_friction", "social_energy_mismatch"],
  "Hold & Ressourcer":  ["collaboration_friction", "work_pace_mismatch"],
  "Trivsel":            ["social_energy_mismatch", "work_pace_mismatch", "role_fit"],
};

const dimensionLabels: Record<Dimension, string> = {
  role_fit:               "Rolle-fit belastning",
  collaboration_friction: "Samarbejdsfriktion",
  work_pace_mismatch:     "Tempo mismatch",
  social_energy_mismatch: "Social energi mismatch",
};

const dimensionTexts: Record<Dimension, { forklaring: string; anbefaling: string }> = {
  role_fit: {
    forklaring:  "Din rolle, dine opgaver eller dit mandat matcher ikke det, du er bedst til – eller det du forventer af dit arbejde.",
    anbefaling:  "Søg klarhed om ansvar og forventninger. En åben samtale med din leder om rolle og mandat kan gøre en stor forskel.",
  },
  collaboration_friction: {
    forklaring:  "Samarbejdet med kolleger eller ledelseslag koster dig energi. Det kan handle om kommunikation, uklare roller eller konflikter.",
    anbefaling:  "Kig på teamdynamikken og kommunikationsvejene. Hvem skal du have en ærlig samtale med?",
  },
  work_pace_mismatch: {
    forklaring:  "Tempoet og presset i dit arbejde matcher ikke det niveau, du kan opretholde over tid.",
    anbefaling:  "Undersøg om deadlines og ressourcer er realistiske. Tal om prioritering og tempo med din leder eller dit team.",
  },
  social_energy_mismatch: {
    forklaring:  "Arbejdsmiljøets sociale dynamik tapper din energi. Det kan være kulturen, tonen eller følelsen af ikke at høre til.",
    anbefaling:  "Undersøg, hvad der driver den sociale friktion. Hvad ville gøre dig mere tryg i dit arbejdsmiljø?",
  },
};

const categoryDisplayNames: Record<Category, string> = {
  "Kultur & Tone":     "Hvordan samarbejdet og tonen opleves i din hverdag",
  "Hold & Ressourcer": "Hvordan rammerne og ressourcerne understøtter dit arbejde",
  "Ansvar & Mandat":   "Hvordan dit ansvar og din rolle hænger sammen i praksis",
  "Trivsel":           "Hvordan dit arbejde påvirker din energi i hverdagen",
};

const categoryColors: Record<Category, string> = {
  "Kultur & Tone": "#295BA8",
  "Hold & Ressourcer": "#C4A03A",
  "Ansvar & Mandat": "#1A6B3A",
  "Trivsel": "#8B3A8B",
};

function RadarChart({ scores, labels }: { scores: Record<string, number>; labels: string[] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 85;
  const cats = labels;
  const n = cats.length;

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const pointsFor = (values: number[]) =>
    values.map((v, i) => {
      const a = angleFor(i);
      return `${cx + r * v * Math.cos(a)},${cy + r * v * Math.sin(a)}`;
    }).join(" ");

  const dataValues = cats.map((cat) => scores[cat] ?? 0);
  const dataPoints = pointsFor(dataValues);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={cats.map((_, i) => {
            const a = angleFor(i);
            return `${cx + r * level * Math.cos(a)},${cy + r * level * Math.sin(a)}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(10,22,40,0.12)"
          strokeWidth="1"
        />
      ))}
      {cats.map((_, i) => {
        const a = angleFor(i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + r * Math.cos(a)}
            y2={cy + r * Math.sin(a)}
            stroke="rgba(10,22,40,0.10)"
            strokeWidth="1"
          />
        );
      })}
      <polygon
        points={dataPoints}
        fill="rgba(196,160,58,0.18)"
        stroke={CURRY}
        strokeWidth="2"
      />
      {dataValues.map((v, i) => {
        const a = angleFor(i);
        return (
          <circle
            key={i}
            cx={cx + r * v * Math.cos(a)}
            cy={cy + r * v * Math.sin(a)}
            r={4}
            fill={CURRY}
          />
        );
      })}
      {cats.map((cat, i) => {
        const a = angleFor(i);
        const lx = cx + (r + 28) * Math.cos(a);
        const ly = cy + (r + 28) * Math.sin(a);
        const shortLabels: Record<string, string> = {
          "Kultur & Tone": "Kultur",
          "Hold & Ressourcer": "Hold",
          "Ansvar & Mandat": "Ansvar",
          "Trivsel": "Trivsel",
        };
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill={TEXT} fontFamily="Arial, sans-serif">
            {shortLabels[cat] ?? cat}
          </text>
        );
      })}
    </svg>
  );
}

type Screen = "intro" | "quiz" | "result";

export default function AltTest() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [role, setRole] = useState<Role | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const empty = (): Record<Category, number> => ({ "Kultur & Tone": 0, "Hold & Ressourcer": 0, "Ansvar & Mandat": 0, "Trivsel": 0 });
  const [scores, setScores] = useState<Record<Category, number>>(empty());
  const [counts, setCounts] = useState<Record<Category, number>>(empty());

  function startTest() {
    if (!role) return;
    const all = [...questionsDB.common, ...questionsDB[role]];
    const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 32);
    setQuestions(shuffled);
    setCurrent(0);
    setScores(empty());
    setCounts(empty());
    setScreen("quiz");
  }

  function answer(idx: number, cat: Category, p: number) {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    setTimeout(() => {
      setScores((s) => ({ ...s, [cat]: s[cat] + p }));
      setCounts((c) => ({ ...c, [cat]: c[cat] + 1 }));
      setSelectedIdx(null);
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
      } else {
        setScreen("result");
      }
    }, 380);
  }

  // Balance 0-100 per kategori (1=bedst→100%, 3=lavest→0%)
  const catBalance: Record<Category, number> = {} as Record<Category, number>;
  CATEGORIES.forEach((cat) => {
    catBalance[cat] = counts[cat] > 0
      ? Math.round(((3 - scores[cat] / counts[cat]) / 2) * 100)
      : 50;
  });

  const answeredCats = CATEGORIES.filter((c) => counts[c] > 0);
  const totalBalance = answeredCats.length > 0
    ? Math.round(answeredCats.reduce((s, c) => s + catBalance[c], 0) / answeredCats.length)
    : 50;

  function getVerdict(pct: number): { text: string; badge: string; color: string } {
    if (pct >= 65) return {
      text: "Du har en oplevelse af, at dit arbejdsliv fungerer godt for dig, og at det du står i, giver mening",
      badge: "I god balance", color: "#1E6B5C",
    };
    if (pct >= 40) return {
      text: "Du har det egentlig godt i dit arbejdsliv – og samtidig begynder du at mærke en nysgerrighed på, om der er noget, der kunne være anderledes",
      badge: "Refleksion", color: "#C4A03A",
    };
    return {
      text: "Du kan mærke, at der er noget i dit arbejdsliv, som ikke helt er, som det bør være – men det er ikke noget, du har fået sat ord på endnu",
      badge: "Klar til forandring", color: "#8B5E3C",
    };
  }

  const verdict = getVerdict(totalBalance);

  return (
    <main style={{ minHeight: "100vh", background: PAGE_BG, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "24px 16px 60px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>

        {/* ─── INTRO ─── */}
        {screen === "intro" && (
          <div style={{ background: WHITE, borderRadius: "24px", overflow: "hidden", boxShadow: "0 8px 32px rgba(10,22,40,0.10)", border: `1px solid ${BORDER}` }}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MED} 100%)`, padding: "48px 32px 36px", textAlign: "center", position: "relative" }}>
              <button
                onClick={() => window.history.back()}
                style={{ position: "absolute", top: "16px", left: "16px", background: "none", border: "none", cursor: "pointer", color: CURRY, fontSize: "14px", fontWeight: 700, padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                ← Tilbage
              </button>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: CURRY, marginBottom: "12px" }}>
                ByggeTalent præsenterer
              </div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "72px", fontWeight: 700, color: WHITE, lineHeight: 1, marginBottom: "8px" }}>
                ALT
              </div>
              <div style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
                Arbejdslivstest
              </div>
            </div>

            <div style={{ padding: "32px 24px" }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: TEXT, marginBottom: "20px", lineHeight: 1.3, textAlign: "center" }}>
                Hvor står du i dit arbejdsliv lige nu?
              </h2>

              <div style={{ background: PAGE_BG, borderRadius: "16px", padding: "20px", marginBottom: "28px", border: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: MUTED, margin: "0 0 12px" }}>
                  Testen ALT er udviklet specifikt til Bygge og Anlægsbranchen. Denne lightudgave giver dig et første indblik i, hvordan dit arbejdsliv opleves for dig lige nu.
                </p>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: TEXT, margin: 0, fontStyle: "italic" }}>
                  ALT handler ikke om rigtigt eller forkert, men om at give dig et roligt øjeblik til at mærke efter.
                </p>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, textAlign: "center", marginBottom: "16px" }}>
                  Vælg din profil for at starte
                </div>
                <div style={{ display: "grid", gap: "10px" }}>
                  {([
                    { key: "leder" as Role, label: "Leder / Ansvarlig", sub: "For dig med personale- eller projektansvar." },
                    { key: "medarbejder" as Role, label: "Fagspecialist / Udførende", sub: "For dig der arbejder med faglige leverancer." },
                    { key: "nyuddannet" as Role, label: "Nyuddannet (0-2 år)", sub: "For dig der er ny i branchen." },
                  ]).map((r) => (
                    <button
                      type="button"
                      key={r.key}
                      onClick={() => setRole(r.key)}
                      style={{
                        textAlign: "left", padding: "16px 18px", borderRadius: "14px",
                        border: role === r.key ? `2px solid ${CURRY}` : `2px solid ${BORDER}`,
                        background: role === r.key ? "#FBF7EC" : WHITE,
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: "16px", fontWeight: 700, color: TEXT, marginBottom: "4px" }}>{r.label}</div>
                      <div style={{ fontSize: "13px", color: MUTED }}>{r.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startTest}
                disabled={!role}
                style={{
                  width: "100%", padding: "17px", borderRadius: "14px", border: "none",
                  background: role ? CURRY : "#D4CCBC",
                  color: role ? WHITE : "#9A9488",
                  fontSize: "16px", fontWeight: 700, cursor: role ? "pointer" : "not-allowed",
                  letterSpacing: "0.01em",
                }}
              >
                {role ? "Start min test →" : "Vælg din profil"}
              </button>
            </div>
          </div>
        )}

        {/* ─── QUIZ ─── */}
        {screen === "quiz" && questions.length > 0 && (
          <div style={{ background: WHITE, borderRadius: "24px", padding: "28px 24px", boxShadow: "0 8px 32px rgba(10,22,40,0.10)", border: `1px solid ${BORDER}` }}>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: categoryColors[questions[current].cat], background: `${categoryColors[questions[current].cat]}18`, padding: "4px 10px", borderRadius: "999px" }}>
                  {questions[current].cat}
                </span>
                <span style={{ fontSize: "13px", color: MUTED, fontWeight: 700 }}>
                  {current + 1} / {questions.length}
                </span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "#E8E3DA", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: CURRY, borderRadius: "999px", width: `${((current + 1) / questions.length) * 100}%`, transition: "width 0.4s ease" }} />
              </div>
            </div>

            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: TEXT, lineHeight: 1.4, marginBottom: "24px", textAlign: "center" }}>
              {questions[current].q}
            </h2>

            <div style={{ display: "grid", gap: "10px" }}>
              {questions[current].options.map((opt, i) => {
                const selected = selectedIdx === i;
                return (
                  <button
                    key={i}
                    onClick={() => answer(i, questions[current].cat, opt.p)}
                    disabled={selectedIdx !== null}
                    style={{
                      textAlign: "left", padding: "16px 18px", borderRadius: "14px",
                      border: `2px solid ${selected ? CURRY : BORDER}`,
                      background: selected ? "#FBF7EC" : WHITE,
                      cursor: selectedIdx !== null ? "default" : "pointer",
                      display: "flex", alignItems: "center", gap: "14px",
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                  >
                    <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: selected ? CURRY : PAGE_BG, border: `1px solid ${selected ? CURRY : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: selected ? WHITE : MUTED, flexShrink: 0, transition: "all 0.15s" }}>
                      {selected ? "✓" : i + 1}
                    </span>
                    <span style={{ fontSize: "15px", color: selected ? TEXT : TEXT, fontWeight: selected ? 600 : 400, lineHeight: 1.4 }}>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── RESULTAT ─── */}
        {screen === "result" && (
          <div style={{ display: "grid", gap: "14px" }}>

            {/* ── Cirkel + verdict (navy) ── */}
            <div style={{ background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_MED} 100%)`, borderRadius: "24px", padding: "36px 24px 28px", boxShadow: "0 8px 32px rgba(10,22,40,0.22)", textAlign: "center" }}>

              {/* Stor donut */}
              <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 20px" }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="16" />
                  <circle cx="70" cy="70" r="54" fill="none" stroke={verdict.color} strokeWidth="16"
                    strokeDasharray={`${(totalBalance / 100) * 339} 339`}
                    strokeLinecap="round" transform="rotate(-90 70 70)" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "34px", fontWeight: 800, color: WHITE, lineHeight: 1 }}>{totalBalance}%</span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.12em", marginTop: "4px" }}>ALT-SCORE</span>
                </div>
              </div>

              {/* Badge */}
              <div style={{ marginBottom: "16px" }}>
                <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: "999px", background: verdict.color, color: WHITE, fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  {verdict.badge}
                </span>
              </div>

              {/* Verdict tekst */}
              <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "rgba(255,255,255,0.88)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                {verdict.text}
              </p>
            </div>

            {/* ── Arbejdsvurdering — 4 kategorier (white) ── */}
            <div style={{ background: WHITE, borderRadius: "24px", padding: "24px", boxShadow: "0 4px 16px rgba(10,22,40,0.07)", border: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>
                  Din arbejdsvurdering
                </div>
                <div style={{ fontSize: "10px", color: MUTED, fontWeight: 600 }}>BALANCE</div>
              </div>

              <div style={{ display: "grid", gap: "22px" }}>
                {CATEGORIES.filter((c) => counts[c] > 0).map((cat) => {
                  const pct = catBalance[cat];
                  const barColor = pct >= 65 ? "#1E6B5C" : pct >= 40 ? "#C4A03A" : "#8B5E3C";
                  return (
                    <div key={cat}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "12px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: TEXT, lineHeight: 1.4, flex: 1 }}>
                          {categoryDisplayNames[cat]}
                        </div>
                        <span style={{ fontSize: "20px", fontWeight: 800, color: barColor, flexShrink: 0 }}>{pct}%</span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "#EDE8DF", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "999px", transition: "width 1.2s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── CTA (navy) ── */}
            <div style={{ background: NAVY, borderRadius: "24px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginBottom: "10px" }}>
                Næste skridt
              </div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "17px", fontWeight: 700, color: WHITE, lineHeight: 1.4, marginBottom: "8px" }}>
                Vil du tale om dit resultat?
              </p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.60)", lineHeight: 1.65, marginBottom: "20px" }}>
                Få en uforpligtende samtale med ByggeTalent om, hvad dine refleksioner peger på.
              </p>
              <button type="button" style={{ width: "100%", padding: "15px", borderRadius: "14px", border: "none", background: CURRY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em" }}>
                Book en samtale nu
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "24px" }}>
            <button
              type="button"
              onClick={() => { setScreen("intro"); setRole(null); }}
              style={{ padding: "12px", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", color: MUTED, fontWeight: 600 }}
            >
              Tag testen forfra
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = "/"; }}
              style={{ padding: "12px", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", color: MUTED, fontWeight: 600 }}
            >
              ← Tilbage til start
            </button>
          </div>
          </div>
        )}
      </div>
    </main>
  );
}
