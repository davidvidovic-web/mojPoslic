'use client'

import { JobList } from "@/components/job-list";

export function JobsClient() {

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">Pretraži oglase za poslove u BiH</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Pregledajte dostupne oglase za posao u Bosni i Hercegovini. 
          Filtrirajte po gradu, kategoriji i tipu posla da pronađete prilike koje vas zanimaju.
        </p>
      </div>

      {/* Note: Filters will be added later */}

      {/* Jobs List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Najnoviji poslovi</h2>
        <JobList />
      </div>

      {/* SEO Content */}
      <div className="mt-16 prose max-w-none">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Popularne kategorije poslova u BiH</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Majstorski radovi:</strong> Različite vrste popravki u kući, sastavljanje namještaja i osnovno održavanje.</p>
              <p><strong>Selidbe i transport:</strong> Kompletne usluge selidbе, pakovanje, transport teškog namještaja i bijele tehnike.</p>
              <p><strong>Čišćenje i održavanje:</strong> Redovno čišćenje kuća i stanova, dubinsko čišćenje, čišćenje nakon renoviranja.</p>
              <p><strong>Dostava i kupovina:</strong> Dostava hrane i namirnica, dostava lekova, kurirske usluge.</p>
              <p><strong>Čuvanje i edukacija:</strong> Čuvanje djece (bejbisiting), privatni časovi, instrukcije.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-4">Gradovi u Bosni i Hercegovini</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Sarajevo:</strong> Glavni grad s najvećim brojem oglasa za posao i najraznovrsnijim prilikama za zaposlenje.</p>
              <p><strong>Banja Luka:</strong> Drugi najveći grad u BiH s rastućim tržištem rada i brojnim mogućnostima.</p>
              <p><strong>Tuzla:</strong> Industrijski centar s potražnjom za stručnim radnicima i servisnim uslugama.</p>
              <p><strong>Mostar:</strong> Povijesni grad s turističkim potencijalom i potrebom za uslužnim djelatnostima.</p>
              <p><strong>Zenica:</strong> Centar čelične industrije s mogućnostima u konstrukcijskim i tehničkim poslovima.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Kako funkcioniše mojPoslić</h2>
          <p className="mb-4">
            mojPoslić je najbrži i najsigurniji način pronalaska posla u Bosni i Hercegovini. 
            Naša platforma povezuje poslodavce s kvalificiranim radnicima u svim glavnim gradovima.
          </p>
          <p>
            Bez obzira tražite li majstorske radove u Sarajevu, selidbe u Banja Luci, ili čišćenje u Tuzli, 
            mojPoslić vam omogućuje da brzo pronađete pravu osobu za posao. Svi naši korisnici su verificirani, 
            a platforma omogućuje sigurnu komunikaciju i dogovaranje termina.
          </p>
        </div>
      </div>
    </div>
  );
}