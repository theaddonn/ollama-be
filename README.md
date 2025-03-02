# Ollama-BE – Ollama Integration for Minecraft

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Ollama-BE is an open-source Minecraft Bedrock Edition Add-On that integrates [Ollama](https://ollama.com/), a local LLM framework for running AI models.
This Add-On goes beyond simple chat interactions—AI models can actively engage with your in-game world!

## Features

- Interact with AI models directly in Minecraft chat
- Access in-game data such as **time, weather, difficulty, gamemode, and inventory**
- Modify game settings like **gamerules, time, and weather** (if enabled)
- Fully customizable AI configuration

Requires @minecraft/server 2.0-beta

---

## Installation & Setup

### 1. Install Ollama

Download and install [Ollama](https://ollama.com/) on your system.

### 2. Install Ollama-BE Add-On

Download the Ollama-BE Add-On and enable it in your Minecraft world.

### 3. Start Ollama & Configure the Add-On

Once Ollama is running, configure it in-game by executing:

```mcfunction
/scriptevent ollama:settings
```

- Set the host (leave default unless you changed the Ollama port).
- Choose your AI model (see recommendations below).

### 4. Chat with Your AI

- Send a message in chat to interact with the AI.
- Use the command:
  ```mcfunction
  /scriptevent ollama:chat <your message>
  ```

### 5. Enable In-Game Functions (Optional)

If activated in the settings, the AI can modify **time, weather, and gamerules** dynamically.

### 6. Get Help

To see available commands, run:

```mcfunction
/scriptevent ollama:help
```

---

## Recommended AI Models

For optimal performance, use:

- **[Llama 3.1](https://ollama.com/library/llama3.1)** – A powerful general-purpose model with tool support.
- **[Mistral-Nemo](https://ollama.com/library/mistral-nemo)** – Offers tool support with a larger context window for better long-term interactions.

---

## License

This project is open-source and licensed under the MIT License.
