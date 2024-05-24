# safezone-mobile
![image](https://github.com/ke-saad/safezone-mobile/assets/132830438/023a375c-bb8a-42c7-b80f-9ebc05b874ca)
GeoGuard est une application dédiée à la surveillance en temps réel des zones sécurisées et dangereuses, utilisant la géolocalisation pour améliorer la sécurité des utilisateurs. Notre technologie aide à identifier et notifier les utilisateurs lorsqu'ils entrent dans des zones à risque, augmentant ainsi la prévention et la réactivité en matière de sécurité.
## Table des Matières
- [Aperçu](#aperçu)
- [Technologies Utilisées](#technologies-utilisées)
- [Structure du Projet](#structure-du-projet)
  - [Frontend Web](#frontend-web)
  - [Frontend Mobile](#frontend-mobile)
  - [Backend](#backend)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Video Demonstration](#Video-Demonstration)
- [Dépendances](#dépendances)
- [Contribuer](#contribuer)

  ## Aperçu
Elle vise aussi à fournir une plateforme intuitive pour la gestion des zones de sécurité grâce à une cartographie détaillée et des notifications en temps réel. Elle permet aux utilisateurs de visualiser rapidement les zones sécurisées (vertes) et dangereuses (rouges) sur une carte interactive.

## Technologies Utilisées
- **Frontend Web**: React JS
- **Frontend Mobile**: React Native
- **Backend**: Node.js avec MongoDB

## Structure du Projet

### Frontend Web (Admin)
Construit avec React JS, ce front-end permet aux administrateurs de :
- **Gérer les zones**:
  - Créer et supprimer des zones sécurisées ou dangereuses sur une carte interactive.
  - Modifier les détails des zones pour refléter les changements de statut ou de niveau de risque.
- **Gérer les comptes utilisateurs**:
  - Créer de nouveaux comptes utilisateurs et gérer les rôles d'accès.
  - Superviser les activités des utilisateurs et leur accès aux différentes zones.

### Frontend Mobile
Utilise React Native pour fournir une application mobile aux utilisateurs finaux, permettant :
- La visualisation des zones sécurisées et dangereuses.
- La réception des alertes en temps réel en fonction de leur localisation.

### Backend
Développé avec Node.js et MongoDB, il s'occupe de :
- Traiter les requêtes API pour la gestion des zones et des comptes utilisateurs.
- Stocker et récupérer les données des zones et des utilisateurs de manière sécurisée.

## Installation
```bash
# Cloner le dépôt
git clone https://exemple.com/geoguard.git
cd geoguard

# Installer les dépendances pour le backend
cd backend
npm install

# Installer les dépendances pour le frontend web
cd ../frontend-web
npm install

# Lancer le serveur backend
npm start

# Lancer l'application frontend web dans un autre terminal
npm start
'''

## Utilisation
Après l'installation, accédez à http://localhost:3000 pour le front-end web admin ou utilisez l'application mobile pour une interaction en temps réel avec les zones.

## Dépendances
React ^17.0.2
React Native ^0.63.4
Node.js ^14.17.0
MongoDB ^4.4.6
Express ^4.17.1
## Video Démonstration

## Contribuer
KELLALI Saad
SIDKI Reda
ELGHOUL Sanaa
BENYAHYA Nour
