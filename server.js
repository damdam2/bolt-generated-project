const express = require('express');
    const sqlite = require('better-sqlite3');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    
    const db = sqlite('conges.db');
    const app = express();
    app.use(express.json());
    
    // Initialisation DB
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT CHECK(role IN ('admin', 'user'))
      )
    `).run();
    
    db.prepare(`
      CREATE TABLE IF NOT EXISTS conges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        start_date TEXT,
        end_date TEXT,
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected')),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `).run();
    
    // Routes
    app.post('/api/login', (req, res) => {
      // Implémentation de l'authentification
    });
    
    app.get('/api/conges', (req, res) => {
      // Récupération des congés
    });
    
    app.post('/api/conges', (req, res) => {
      // Création d'une demande de congé
    });
    
    app.put('/api/conges/:id', (req, res) => {
      // Validation d'un congé
    });
    
    app.listen(3000, () => {
      console.log('Server running on port 3000');
    });
