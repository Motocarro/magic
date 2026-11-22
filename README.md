# Fascicolo (repo "magic")
1. Copia le foto (max ~800px) e la clip del sorpasso (breve, leggera) in `in_chiaro/`, compila `in_chiaro/dati.json`.
2. `node cifra.js` -> crea `pacchetto.json`, `intel.json` e `m0.json`, `m1.json`... (uno per ogni foto/video); stampa il codice intelligence (verificalo!). Obiettivo peso: foto ~100-200 KB, clip < 10 MB.
3. Carica su GitHub (repo pubblico `magic`): `index.html`, `404.html`, `pacchetto.json`, `intel.json` e tutti i `m*.json`. NON `in_chiaro/` (c'è nel .gitignore: crea il .gitignore PRIMA del primo commit, la cronologia git conserva tutto).
4. Settings > Pages > branch main, cartella root. URL: `https://motocarro.github.io/magic/`
5. Test locale: `python3 -m http.server` e apri `localhost:8000` (non il doppio clic). Prova generale in finestra anonima.
Il giorno X serve solo un browser con internet (hotspot del telefono come piano B). Il progresso resta nel browser: usa una finestra anonima.
Risposte dei frammenti: devono essere univoche (il sito ignora maiuscole, accenti, spazi e punteggiatura).
