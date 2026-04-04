const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const keyLine = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY='));
const key = keyLine.split('=')[1].trim();

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(r => r.json())
  .then(data => {
    const flashModels = data.models.filter(m => m.name.includes('flash'));
    const allModels = data.models.map(m => m.name);
    console.log("ALL MODELS:");
    console.log(allModels);
  })
  .catch(console.error);
