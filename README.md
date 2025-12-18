# Krea AI MCP Server

Serveur MCP (Model Context Protocol) pour l'API Krea AI. Permet la génération d'images et de vidéos avec plus de 30 modèles IA différents.

## 🎨 Modèles supportés

### Génération d'images
- **Flux** (Pro 1.1, Pro, Dev, Schnell, General, Realism)
- **Nano Banana** (Pro) - Génération ultra-rapide
- **Ideogram** (V2, V2 Turbo)
- **Google Imagen** (3.0 Generate/Capability)
- **Seedream** (3.0, 2.0)
- **ChatGPT Image** (4o Image Preview)
- **Runway** (Gen3 Turbo Image)
- Et plus...

### Génération de vidéos
- **Kling** (1.5 Pro/Standard, 1.6 Pro/Standard)
- **Hailuo** (MiniMax Standard/HD)
- **Google Veo** (2.0 Generate)
- **Wan** (T2V 1.3B, I2V 480p/720p)
- **Pika** (V1.5)
- **Seedance** (1.0 Lite)
- **Runway** (Gen3 Turbo I2V)
- **Luma Ray** (2 Flash)
- Et plus...

### Autres fonctionnalités
- **Upscaling** d'images (Real ESRGAN, Clarity)
- **Gestion des styles** Krea AI
- **Assets** et gestion de fichiers
- **Jobs** et suivi d'état

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/baptitse-jn/krea-ai-mcp-server.git
cd krea-ai-mcp-server

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec votre clé API Krea

# Compiler le projet
npm run build
```

## ⚙️ Configuration

Créez un fichier `.env` basé sur `.env.example`:

```env
KREA_API_KEY=votre_cle_api_krea
TRANSPORT_MODE=stdio  # ou 'http'
PORT=3000            # si mode HTTP
```

## 🚀 Utilisation

### Mode stdio (recommandé pour MCP)

```bash
npm start
```

### Mode HTTP (pour tests)

```bash
TRANSPORT_MODE=http npm start
```

### Configuration Claude Desktop

Ajoutez dans votre configuration Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "krea-ai": {
      "command": "node",
      "args": ["/chemin/vers/krea-ai-mcp-server/dist/index.js"],
      "env": {
        "KREA_API_KEY": "votre_cle_api"
      }
    }
  }
}
```

## 🛠️ Tools disponibles

### Génération d'images

| Tool | Description |
|------|-------------|
| `generate_image_flux_pro_1_1` | Génère avec Flux Pro 1.1 |
| `generate_image_flux_pro` | Génère avec Flux Pro |
| `generate_image_flux_dev` | Génère avec Flux Dev |
| `generate_image_flux_schnell` | Génère avec Flux Schnell |
| `generate_image_nano_banana_pro` | Génération ultra-rapide |
| `generate_image_ideogram_v2` | Génère avec Ideogram V2 |
| `generate_image_ideogram_v2_turbo` | Génère avec Ideogram V2 Turbo |
| `generate_image_imagen_3` | Génère avec Google Imagen 3.0 |
| `generate_image_seedream_3` | Génère avec Seedream 3.0 |
| `generate_image_chatgpt_4o` | Génère avec ChatGPT 4o |
| `generate_image_runway_gen3` | Génère avec Runway Gen3 Turbo |

### Génération de vidéos

| Tool | Description |
|------|-------------|
| `generate_video_kling_1_6_pro` | Vidéo avec Kling 1.6 Pro |
| `generate_video_kling_1_6_standard` | Vidéo avec Kling 1.6 Standard |
| `generate_video_kling_1_5_pro` | Vidéo avec Kling 1.5 Pro |
| `generate_video_hailuo_standard` | Vidéo avec Hailuo Standard |
| `generate_video_hailuo_hd` | Vidéo avec Hailuo HD |
| `generate_video_veo_2` | Vidéo avec Google Veo 2.0 |
| `generate_video_wan` | Vidéo avec Wan |
| `generate_video_pika_1_5` | Vidéo avec Pika 1.5 |
| `generate_video_seedance` | Vidéo avec Seedance |
| `generate_video_runway_gen3` | Vidéo avec Runway Gen3 I2V |
| `generate_video_luma_ray_2` | Vidéo avec Luma Ray 2 Flash |

### Utilitaires

| Tool | Description |
|------|-------------|
| `upscale_image` | Upscaling d'image |
| `get_job_status` | Récupère l'état d'un job |
| `list_jobs` | Liste les jobs récents |
| `list_assets` | Liste les assets |
| `upload_asset` | Upload un fichier |
| `list_styles` | Liste les styles Krea |
| `create_style` | Crée un nouveau style |

## 📝 Exemples

### Générer une image avec Flux Pro

```javascript
// Via MCP
{
  "tool": "generate_image_flux_pro_1_1",
  "arguments": {
    "prompt": "A beautiful sunset over mountains",
    "aspectRatio": "16:9",
    "outputFormat": "png"
  }
}
```

### Générer une vidéo avec Kling

```javascript
{
  "tool": "generate_video_kling_1_6_pro",
  "arguments": {
    "prompt": "A cat playing with a ball",
    "duration": 5,
    "aspectRatio": "16:9"
  }
}
```

## 🔑 Obtenir une clé API

1. Créez un compte sur [krea.ai](https://krea.ai)
2. Accédez aux paramètres de votre compte
3. Générez une clé API

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
