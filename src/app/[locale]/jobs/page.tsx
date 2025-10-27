import { Metadata } from 'next';
import { JobList } from "@/components/job-list";

export const metadata: Metadata = {
  title: "Pretraži oglase za posao | mojPoslić",
  description: "Pretraži i apliciraj na oglase za posao kroz našu digitalnu platformu. Filtriraj po kategoriji, lokaciji i tipu posla. Direktno komuniciraj sa poslodavcima.",
  keywords: [
    "oglasi za posao BiH",
    "aplikacije za posao",
    "pretraži poslove Sarajevo",
    "posao Banja Luka",
    "prilike za rad Tuzla",
    "digitalna platforma Mostar",
    "job board BiH",
    "online aplikacije",
    "radne prilike",
    "posao BiH",
    "platforma za poslove",
    "upravljanje aplikacijama",
    "direktno porukovanje"
  ],
  openGraph: {
    title: "Pretraži oglase za posao | mojPoslić",
    description: "Pretraži i apliciraj na oglase za posao kroz našu digitalnu platformu. Filtriraj po kategoriji, lokaciji i tipu posla.",
    type: "website"
  }
};

export default function JobsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">Pretraži oglase za posao</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Pretraži dostupne oglase za posao, filtriraj po kategorijama i lokacijama. 
          Apliciraj direktno kroz platformu i komuniciraj sa poslodavcima!
        </p>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Dostupni oglasi za posao</h2>
        <JobList />
      </div>

      {/* SEO Content */}
      <div className="mt-16 prose max-w-none">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Funkcionalnosti platforme mojPoslić</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Objavljuj oglase:</strong> Kreiraj detaljne oglase za posao sa opisom, lokacijom i potrebnim vještinama.</p>
              <p><strong>Pretraži poslove:</strong> Filtriraj poslove po kategoriji, lokaciji, tipu posla i vremenskom okviru.</p>
              <p><strong>Aplikacije:</strong> Apliciraj na poslove koristeći konekcije i prati status svojih aplikacija.</p>
              <p><strong>Direktno porukovanje:</strong> Komuniciraj sa poslodavcima ili radnicima kroz integrisani sistem poruka.</p>
              <p><strong>Upravljanje profilom:</strong> Kreiraj profesionalni profil sa vještinama, iskustvom i portfolio-om.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-4">Brza pomoć po gradovima BiH</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Sarajevo:</strong> Glavna regija s najvećim brojem radnika dostupnih za hitne popravke, pomoć za selidbu, čišćenje na zahtjev.</p>
              <p><strong>Banja Luka:</strong> Drugi najveći grad u BiH s rastućom mrežom fleksibilnih radnika dostupnih za različite vrste pomoći.</p>
              <p><strong>Tuzla:</strong> Industrijski centar s pomoćnicima na poziv - od čišćenja do transporta, prema potrebi.</p>
              <p><strong>Mostar:</strong> Povijesni grad s radnicima na zahtjev - turistička sezona ili hitne kućne potrebe.</p>
              <p><strong>Zenica:</strong> Centar čelične industrije s majstorima i pomoćnicima za industrijske i kućne popravke.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Kako funkcioniše platforma mojPoslić</h2>
          <p className="mb-4">
            mojPoslić je digitalna platforma koja povezuje poslodavce i radnike u Bosni i Hercegovini. 
            Kroz naš sistem konekcija omogućavamo efikasno upravljanje aplikacijama i direktnu komunikaciju.
          </p>
          <p>
            Registruj se kao radnik i pretraži dostupne oglase po kategorijama i lokacijama. 
            Ako si poslodavac, objavi oglas i upravljaj aplikacijama kroz naš dashboard. 
            Sva komunikacija se odvija kroz integrisani sistem poruka - jednostavno i sigurno!
          </p>
        </div>
      </div>
    </div>
  );
}
