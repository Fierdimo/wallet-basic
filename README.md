# mi-dapp

Aplicación móvil multiplataforma de demostración para consultar y operar un token ERC-20. Está construida con Expo, React Native, Expo Router y ethers 6.

> **Estado:** prototipo de desarrollo local. La app usa Anvil y claves de cuentas de prueba incluidas en el código. No está preparada para fondos reales ni para producción.

## Funcionalidades actuales

- Consulta nombre, símbolo, suministro total y balance del token configurado.
- Permite seleccionar cuentas de prueba generadas por Anvil.
- Incluye formularios para transferir, aprobar una allowance, ejecutar `transferFrom` y mintear.
- Muestra movimientos reconstruidos a partir de eventos `Transfer` del contrato.
- Actualiza los datos al detectar transferencias del token.

Las pantallas de inicio y Explore todavía contienen contenido del template de Expo. La app **aún no** integra una wallet externa mediante WalletConnect/Reown, pagos por QR/NFC ni una red pública.

## Requisitos

- Node.js 22.13 o posterior.
- npm.
- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) y sus dependencias, instaladas desde `package.json`.
- [Foundry/Anvil](https://book.getfoundry.sh/anvil/) para la EVM local.
- Un despliegue del contrato ERC-20 `MiToken` accesible desde la app.

## Ejecutar localmente

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Inicia Anvil y despliega `MiToken` en esa instancia. La dirección del contrato cambia si despliegas de nuevo o reinicias la cadena; actualiza `CONTRACT_ADDRESS` en `src/services/blockchain/core/blockchain.ts` para que coincida con el despliegue actual.

3. Configura `MAC_IP` en ese mismo archivo. En un simulador o emulador puede usarse una dirección local adecuada para ese entorno. En un teléfono físico, usa la IP local de tu Mac y asegúrate de que el teléfono pueda alcanzar el RPC de Anvil por la red local.

4. Inicia la aplicación:

   ```bash
   npx expo start
   ```

   Usa las opciones del terminal para abrirla en iOS, Android o web. Para abrir la versión web directamente:

   ```bash
   npx expo start --web
   ```

La wallet, Anvil y la app deben apuntar a la misma cadena. No expongas el RPC de Anvil a Internet.

## Configuración del contrato

La conexión RPC, la dirección y el ABI del token están en `src/services/blockchain/core/blockchain.ts`. El ABI human-readable debe declarar cada función, evento o error que la app utilice; si falta una entrada, ethers no podrá invocarla o decodificarla correctamente.

Si el proyecto de Solidity está en `../contracts` y Remix genera `../contracts/artifacts/MiToken.json`, puedes imprimir las firmas del ABI con ethers desde la raíz de esta app:

```bash
node -e 'const {Interface}=require("ethers"); console.log(new Interface(require("../contracts/artifacts/MiToken.json").abi).format().join("\n"))'
```

Compara las firmas generadas con `TOKEN_ABI` y copia solo las que necesita la app. No incluyas el bytecode del contrato en `TOKEN_ABI`.

## Seguridad y límites

- `src/services/blockchain/core/accounts.ts` contiene claves privadas públicas de prueba de Anvil. Son conocidas y solo sirven para desarrollo local; nunca las uses con fondos reales.
- Las operaciones actuales firman con esas claves locales. En particular, el mint usa la cuenta owner configurada en el código.
- Anvil es una cadena local de desarrollo, no una L2 pública. Un despliegue local no se comparte con otros dispositivos o usuarios si no tienen acceso a esa misma instancia.
- Antes de usar una testnet, hace falta configurar la red y el contrato desplegado allí. Antes de producción, hace falta sustituir la firma local por una wallet del usuario y revisar seguridad, manejo de errores y configuración de red.

## Roadmap

El orden prioriza convertir el prototipo en una demo que otra persona pueda probar y que demuestre habilidades Web3 de extremo a extremo.

### 1. Dar forma al producto

- Reemplazar las pantallas de bienvenida de Expo por una experiencia centrada en el token.
- Definir usuario, red objetivo y flujo principal: consultar balance y enviar tokens.
- Mejorar estados de carga, error, confirmación y empty state; evitar conversiones de importes mediante `Number` para valores de token.

### 2. Desplegar el contrato en una testnet

- Elegir una testnet compatible con el contrato.
- Desplegar y verificar el ERC-20; documentar chain ID, dirección y cómo obtener fondos de prueba.
- Separar la configuración local de Anvil de la configuración de testnet.

### 3. Conectar una wallet externa

- Integrar Reown AppKit/WalletConnect en el proyecto Expo existente.
- Mostrar una sola cuenta conectada y la red activa; manejar conexión, desconexión y cambio de cuenta/red.
- Sustituir la firma con claves privadas locales por solicitudes de firma aprobadas en la wallet.
- Verificar que las transacciones se preparan para la red y el contrato esperados.

### 4. Crear el flujo de pago por QR

- Definir una solicitud de pago con red, dirección del token, destinatario, importe y referencia opcional.
- Escanear y validar la solicitud; mostrar todos los detalles y exigir confirmación explícita antes de firmar.
- Presentar estado pendiente, resultado, hash de transacción y enlace al explorador.
- Añadir NFC más adelante como otra forma de transmitir la misma solicitud, no como un mecanismo que envía fondos automáticamente.

### 5. Calidad y presentación

- Añadir pruebas del contrato y pruebas enfocadas en validación, errores y estados de transacción.
- Documentar límites, decisiones y pasos reproducibles para ejecutar la demo.
- Publicar una build de demostración en testnet con una advertencia clara: no usar fondos reales.

## Comprobaciones

```bash
npx expo lint
npx tsc --noEmit
```