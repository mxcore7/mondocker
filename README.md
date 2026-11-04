# Marvel-Tech — VLESS TCP over WebSocket

Ce dépôt contient un **serveur VLESS TCP minimal sur WebSocket** destiné à des tests sur une infrastructure que vous gérez. Il écoute sur `PORT` (8080 par défaut) et sur le chemin WebSocket `/@Marvel-Tech`.

## 1. Mettre les fichiers sur GitHub

Créez un dépôt `marvel-tech-vless`, puis utilisez « Add file → Upload files » pour envoyer **le contenu décompressé** de ce ZIP. Conservez les dossiers `src`, `scripts` et `.github`.

## 2. Exécuter localement

```bash
npm install
npm test
npm start
```

Ouvrez `http://localhost:8080/healthz` pour vérifier le démarrage.

## 3. Déploiement

Le dépôt contient un `Dockerfile` pour un hébergement compatible Docker/Cloud Run. Il ne faut pas confondre le **port interne** (8080) et le port TLS externe 443, normalement géré par le reverse proxy de la plateforme.

Les variables d'environnement optionnelles : `PORT`, `VLESS_UUID`, `VLESS_PATH`. En production, utilisez un UUID secret différent, configuré comme secret de l'hébergeur.

Google AI Studio Build est surtout conçu pour des applications web. L'importation du dépôt, l'exécution de ce serveur TCP-over-WebSocket, l'attribution du sous-domaine demandé et le fonctionnement en production **ne sont pas garantis**. Si AI Studio ne déploie pas ce conteneur, essayez directement Cloud Run avec les permissions et la facturation appropriées.

## 4. Lien souhaité

Voir `VLESS-LINK.txt`, ou :

```bash
node scripts/make-link.js
```

Le fichier de lien contient exactement :
- IP `192.179.18.100`
- Port `443`
- SNI `crashlyticsreports-pa.googleapis.com`
- Host `marvel-ech.ai.studio`
- WebSocket path `/@Marvel-Tech` (encodé dans l'URL comme `%2F%40Marvel-Tech`)
- UUID `6f6d52f0-b245-4c42-b939-32ee389e5515`

### IMPORTANT — limitation réseau

Le lien **est un texte de configuration, pas la preuve qu'un serveur fonctionne**.

- L'IP `192.179.18.100` doit réellement pointer vers un serveur/proxy qui accepte ces connexions. Un déploiement AI Studio ne vous attribue pas cette IP à la demande.
- Le nom TLS SNI `crashlyticsreports-pa.googleapis.com` est différent de `marvel-ech.ai.studio`. Pour fonctionner sans erreurs de certificat, l'infrastructure à cette IP doit explicitement prendre en charge ce routage et présenter un certificat TLS valide pour le SNI. Ce dépôt ne peut ni configurer ni garantir ce comportement sur des serveurs Google/tiers.
- Si la plateforme prend seulement en charge le nom `marvel-ech.ai.studio`, utiliser également ce nom comme SNI et comme adresse est le scénario TLS classique, mais cela ne satisfait pas vos paramètres imposés.
- Cette implémentation n'accepte que la commande VLESS TCP. UDP et d'autres options du protocole ne sont pas pris en charge.
- Les durées de WebSocket sur Cloud Run sont limitées par la configuration de timeout de requête.

Aucune promesse de fonctionnement n'est faite avec l'IP/SNI imposés sans contrôle de l'infrastructure correspondante.
"# mondocker" 
"# mondocker" 
