# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Obtener el ABI del contrato

La app habla con el contrato a través de `TOKEN_ABI` en [`src/services/blockchain/core/blockchain.ts`](src/services/blockchain/core/blockchain.ts), escrito en formato _human-readable_ de ethers. Si una función, evento o error no está ahí, ethers no puede llamarlo ni decodificarlo (por ejemplo, un revert aparece como `unknown custom error`).

### De dónde sale

Al compilar en Remix se genera `../contracts/artifacts/MiToken.json` (~470 KB). Casi todo es bytecode; lo único que importa es la clave `abi`, al final del archivo:

```
MiToken.json
├── deploy                → configuración de deploy por red
├── data
│   ├── bytecode          → código para desplegar
│   ├── deployedBytecode  → código que queda en la cadena
│   ├── gasEstimates      → gas estimado por función
│   └── methodIdentifiers → selectores, ej: "transfer(address,uint256)": "a9059cbb"
└── abi                   → ⭐ funciones, eventos y errores del contrato
```

### Listar cada elemento en formato `TOKEN_ABI`

Desde la raíz de `mi-dapp` (usa el `ethers` del proyecto):

```bash
# Todo el ABI, una línea por elemento
node -e 'const {Interface}=require("ethers"); console.log(new Interface(require("../contracts/artifacts/MiToken.json").abi).format().join("\n"))'
```

Filtrar por tipo (`function`, `event` o `error`):

```bash
node -e 'const {Interface}=require("ethers"); const t=process.argv[1]; new Interface(require("../contracts/artifacts/MiToken.json").abi).fragments.filter(f=>f.type===t).forEach(f=>console.log(f.format("full")))' event
```

Como arreglo listo para pegar en `TOKEN_ABI`:

```bash
node -e 'const {Interface}=require("ethers"); console.log(JSON.stringify(new Interface(require("../contracts/artifacts/MiToken.json").abi).format(), null, 2))'
```

> Omite la línea `constructor(...)`: solo se usa en el deploy.

### Leerlo a mano

Cada elemento de `abi` tiene un `type`. Así se traduce al formato de `TOKEN_ABI`:

```json
{
  "type": "event",
  "name": "Transfer",
  "inputs": [
    { "indexed": true,  "name": "from",  "type": "address" },
    { "indexed": true,  "name": "to",    "type": "address" },
    { "indexed": false, "name": "value", "type": "uint256" }
  ]
}
```

→ `"event Transfer(address indexed from, address indexed to, uint256 value)"`

- `type` → palabra inicial: `function`, `event` o `error`.
- `name` → el nombre.
- `inputs` → parámetros en orden como `tipo nombre`; en eventos agrega `indexed` si `"indexed": true`.
- `stateMutability` (funciones) → `view`/`pure` se escriben tras los paréntesis; `nonpayable` se omite; `payable` se escribe.
- `outputs` (funciones) → `returns (tipo)` al final.
- `internalType` → se ignora.

La firma debe coincidir exacto con Solidity (nombre, tipos, orden e `indexed`): el nodo identifica eventos y errores por el hash de `Nombre(tipos)`, así que un tipo distinto hace que nunca coincidan.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
