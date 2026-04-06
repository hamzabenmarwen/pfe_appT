# Presentation Visuelle - Architecture Technique

## 1. Vue systeme globale

```mermaid
flowchart LR
  U[Utilisateur Web] --> F[Frontend React Vite]
  F -->|HTTPS REST /api| B[Backend Express TypeScript]
  B -->|ORM Prisma| D[(PostgreSQL)]
  B --> S1[(uploads/images)]
  B --> S2[(uploads/invoices)]
```

Lecture:
- Le frontend ne parle jamais directement a la base.
- Le backend centralise securite, logique metier et persistance.
- Les fichiers images et PDF sont stockes sur disque cote backend.

## 2. Architecture backend par couches

```mermaid
flowchart TD
  R[Routes] --> C[Controllers]
  C --> V[Validation Zod + parsing]
  V --> S[Services metier]
  S --> P[Prisma Client]
  P --> DB[(PostgreSQL)]

  M1[authenticate/authorizeAdmin] --> R
  M2[upload multer] --> R
  M3[requestLogger] --> R
  EH[errorHandler global] --> C
  EH --> S
```

Lecture:
- Les routes definissent URL + middlewares.
- Les controllers transforment HTTP en donnees metier.
- Les services appliquent les regles business.
- Prisma encapsule les requetes SQL.

## 3. Flux authentification et refresh token

```mermaid
sequenceDiagram
  participant UI as Frontend
  participant API as Backend
  participant DB as PostgreSQL

  UI->>API: POST /api/auth/login
  API->>DB: find user by email
  DB-->>API: user + password hash
  API-->>UI: accessToken + refreshToken + user

  UI->>API: GET /api/orders (Bearer accessToken)
  API-->>UI: 401 expired
  UI->>API: POST /api/auth/refresh (refreshToken)
  API-->>UI: new accessToken + new refreshToken
  UI->>API: retry original request
  API-->>UI: 200 data
```

Lecture:
- Le refresh est pilote par interceptor Axios.
- Si refresh echoue, la session est nettoyee et redirection login.

## 4. Flux commande et stock

```mermaid
sequenceDiagram
  participant C as Client
  participant FE as Frontend
  participant API as OrdersService
  participant DB as PostgreSQL

  C->>FE: Valider panier
  FE->>API: POST /api/orders (items)
  API->>DB: verifier plats + stock + disponibilite
  API->>DB: transaction create order + orderItems
  API->>DB: decrement stock
  API->>DB: increment loyalty points
  API-->>FE: commande creee
```

Lecture:
- Le total est recalcule serveur.
- Les updates critiques sont transactionnelles.

## 5. Flux event -> devis -> facture

```mermaid
stateDiagram-v2
  [*] --> EventPending: Creation event
  EventPending --> EventQuoted: Creation devis
  EventQuoted --> EventConfirmed: Accept devis
  EventQuoted --> EventPending: Reject devis (event reste non confirme)
  EventConfirmed --> InvoiceCreated: Create invoice from devis
  InvoiceCreated --> InvoicePaid: Mark as paid
```

Lecture:
- Le cycle commercial est explicite et traçable.
- Une facture peut venir d une commande classique ou d un devis evenementiel.

## 6. Matrice droits d acces

```mermaid
flowchart TB
  A[Utilisateur non connecte] -->|GET catalogue| P1[OK]
  A -->|POST order| P2[Refuse]

  C[Utilisateur CLIENT] -->|Orders perso| C1[OK]
  C -->|Create event| C2[OK]
  C -->|Admin routes| C3[Refuse]

  AD[Utilisateur ADMIN] -->|CRUD catalogue| A1[OK]
  AD -->|Production board| A2[OK]
  AD -->|Clients/Analytics/Invoices| A3[OK]
```

## 7. Amelioration typographique recommandee

Objectif:
- meilleure lisibilite sur paragraphes longs,
- identite visuelle plus premium,
- contraste clair entre titres et corps de texte.

Direction retenue:
- Titres: Cormorant Garamond (editorial haut de gamme).
- Texte courant: Manrope (moderne, lisible, numerique).

Regles pratiques:
- Taille de base body: 16px.
- Line-height body: 1.65.
- Line-height titres: 1.08 a 1.15.
- Letter spacing titres: leger negatif.
- Longueur ligne ideale: 60 a 80 caracteres pour texte dense.

## 8. Priorites d evolution architecture
1. Externaliser uploads vers S3 compatible (scalabilite multi-instance).
2. Basculer refresh token vers cookie httpOnly (securite XSS).
3. Ajouter OpenAPI pour contrat API standardise.
4. Ajouter tests integration sur flux critiques (orders/events/invoices).
