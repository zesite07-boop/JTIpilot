/**
 * JTIPilot — Cloudflare Worker : Proxy CORS pour Anthropic API
 * 
 * DÉPLOIEMENT :
 * 1. Aller sur https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Coller ce code, nommer le worker "jtipilot-proxy"
 * 3. Déployer → URL sera : https://jtipilot-proxy.VOTRE-SOUS-DOMAINE.workers.dev
 * 4. Dans candidats2.html, remplacer PROXY_URL par cette URL
 * 
 * SÉCURITÉ : Le worker valide l'Origin pour n'accepter que votre domaine GitHub Pages
 */

// Remplacer par votre domaine GitHub Pages
const ALLOWED_ORIGINS = [
  'https://VOTRE-USERNAME.github.io',
  'http://localhost:5500',   // VS Code Live Server
  'http://localhost:3000',
  'http://127.0.0.1:5500'
];

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // Seules les requêtes POST sont acceptées
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Vérifier l'Origin (sécurité basique)
    if (!ALLOWED_ORIGINS.includes(origin) && !origin.includes('localhost')) {
      return new Response('Forbidden', { status: 403 });
    }

    // Récupérer la clé API depuis les headers ou l'env Cloudflare
    // Priorité : header X-Api-Key > variable d'env ANTHROPIC_API_KEY
    const apiKey = request.headers.get('X-Api-Key') || env.ANTHROPIC_API_KEY || '';
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key manquante' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Lire le body de la requête
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Body JSON invalide' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Forcer le modèle à claude-haiku-4-5 (moins cher pour l'extraction CV)
    body.model = body.model || 'claude-haiku-4-5-20251001';
    body.max_tokens = body.max_tokens || 1024;

    // Appel vers Anthropic
    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    // Retourner avec headers CORS
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
        'X-Proxy': 'JTIPilot-CF-Worker'
      }
    });
  }
};
