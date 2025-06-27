# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# React + TypeScript + Vite - Fotboll-tipset

Denna mall ger en minimal installation för att få React att fungera i Vite med HMR och några ESLint-regler.

## 🎨 Nya funktioner

### Tema-växlare
Applikationen stödjer nu tre olika teman:
- **Ljust tema** - Klassiskt ljust tema för dagbruk
- **Mörkt tema** - Mörkt tema för kvällsbruk och bättre ergonomi
- **Mysigt tema** - Varmt och mysigt tema med jordnära färger

#### Så här använder du tema-växlaren:
1. Klicka på palett-ikonen (🎨) i den övre navigationsraden
2. Välj önskat tema från menyn
3. Ditt val sparas automatiskt och kommer ihåg nästa gång du besöker sidan

#### För utvecklare:
Tema-systemet är byggt med:
- Material-UI theming system
- React Context för tema-hantering
- localStorage för att komma ihåg användarens val
- TypeScript för typsäkerhet
