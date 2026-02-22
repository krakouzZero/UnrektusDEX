# Wojak Finance DEX (Uniswap V2 Fork)

Base technique:
- `@uniswap/v2-core`
- `@uniswap/v2-periphery`

Ce repo fournit un starter prêt à déployer pour un DEX V2 brandé **Wojak Finance**.

## 1) Installation

```bash
corepack enable
corepack pnpm install
cp .env.example .env
```

Le `postinstall` crée automatiquement un fallback local de `@uniswap/lib/TransferHelper.sol` (utile si npm est partiellement indisponible).
Il patch aussi le `init code hash` de `UniswapV2Library` pour correspondre à la compilation locale du pair (sinon `addLiquidity/swap` cassent sur un fork local).

## 2) Compiler

```bash
corepack pnpm compile
```

## 3) Déployer en local

Terminal 1:
```bash
corepack pnpm node
```

Terminal 2:
```bash
corepack pnpm deploy:local
```

Tu obtiens:
- `WETH9`
- `WojakFactory`
- `WojakRouter02`

## 4) Créer une paire de test

Par défaut, le script lit automatiquement la factory depuis `deployments/localhost.json` (généré par `deploy:local`).
Tu peux aussi forcer via `.env` avec `FACTORY_ADDRESS`.

```bash
corepack pnpm pair:local
```

Script inclus:
- Déploie `uREKT`
- Déploie `WJACK`
- Crée la paire sur la factory

## 5) Seed de liquidité (uREKT/WETH)

```bash
corepack pnpm seed:local
```

Variables optionnelles:
- `SEED_TOKEN_AMOUNT` (défaut: `1000000`)
- `SEED_ETH_AMOUNT` (défaut: `10`)

## 6) Test de swap (uREKT -> ETH)

```bash
corepack pnpm swap:test:local
```

Variable optionnelle:
- `SWAP_TOKEN_IN` (défaut: `1000`)

## 7) Flow complet local

Terminal 1:
```bash
corepack pnpm node
```

Terminal 2:
```bash
corepack pnpm deploy:local
corepack pnpm pair:local
corepack pnpm seed:local
corepack pnpm swap:test:local
```
## 8) Déployer sur Sepolia

Dans `.env`:
- `PRIVATE_KEY`
- `RPC_URL`
- optionnel `FEE_TO_SETTER`

```bash
corepack pnpm deploy:sepolia
```

## 9) Intégration frontend

Pour un front rapide sans forker toute l'interface:
- utiliser `@uniswap/widgets`
- configurer `jsonRpcEndpoint`, `tokenList`, `defaultInputTokenAddress`, `defaultOutputTokenAddress`
- pointer sur ton `WojakRouter02`

## 10) UI locale prête à voir

Terminal 1 (node Hardhat):
```bash
corepack pnpm node
```

Terminal 2 (si besoin, redéployer):
```bash
corepack pnpm deploy:local
corepack pnpm pair:local
```

Terminal 3 (UI):
```bash
corepack pnpm ui:serve
```

Puis ouvrir:
`http://127.0.0.1:4173`

L'UI expose:
- page principale Swap (style Uniswap V2)
- bloc Claim visible en haut de la page Swap
- module swap `uREKT -> ETH` avec slippage
- module liquidité (add/remove %)
- faucet `uREKT` (mint sur MockERC20)
- activity feed des transactions exécutées depuis l'UI

### Wallet + Multichain

- L'UI se connecte a MetaMask (`Connect Wallet`) et signe les transactions cote navigateur.
- La config chaines est dans `ui/chains.json`:
  - `hardhat` (local, adresses lues depuis `deployments/localhost.json`)
  - `dogechain` (base mainnet pour Wojak Finance)
- Pour Dogechain, renseigne les adresses de tes contrats dans:
  - `ui/chains.json` -> `chains.dogechain.contracts.router`
  - `ui/chains.json` -> `chains.dogechain.contracts.factory`
  - `ui/chains.json` -> `chains.dogechain.contracts.weth`
  - `ui/chains.json` -> `chains.dogechain.contracts.tokenA`
  - optionnel `ui/chains.json` -> `chains.dogechain.contracts.claim`
- Si la chain n'est pas presente dans MetaMask, l'UI tente `wallet_addEthereumChain` automatiquement.

### Preparation Dogechain (auto)

1. Renseigne `.env`:
   - `DOGECHAIN_RPC_URL`
   - `DOGECHAIN_PRIVATE_KEY`
   - optionnel `DOGECHAIN_TOKEN_A` (token principal deja deploye)

2. Deploy core sur Dogechain:
```bash
corepack pnpm deploy:dogechain
```

Si tu utilises ton token existant sur Dogechain:
```bash
corepack pnpm pair:live:dogechain
```

3. Injecte automatiquement les adresses dans l'UI:
```bash
corepack pnpm ui:sync:dogechain
```

Commande combinee:
```bash
corepack pnpm prepare:dogechain
```

Ensuite:
- redemarre `corepack pnpm ui:serve`
- dans l'UI, selectionne `Dogechain Mainnet` puis reconnecte MetaMask.

### Migration LP Branding (WOJAK-V2)

Le LP token est rebrand on-chain en:
- `name = Wojak Finance V2`
- `symbol = WOJAK-V2`

Important:
- cela change le bytecode du pair et son init hash
- il faut redeployer Factory/Router et recreer les paires
- les anciennes paires "Uniswap V2" ne changent pas de nom

### Migration Holders (Merkle Claim 1:1)

Tu choisis toi-meme le block de snapshot (ex: `SNAPSHOT_BLOCK=55210000`).

1. Snapshot de l'ancien token:
```bash
SNAPSHOT_BLOCK=55210000 SNAPSHOT_TOKEN_ADDRESS=0xOLD_TOKEN corepack pnpm snapshot:token
```

Option test rapide (1 wallet auto, sans JSON manuel):
```bash
SNAPSHOT_BLOCK=55210000 SNAPSHOT_TOKEN_ADDRESS=0xOLD_TOKEN SNAPSHOT_WALLET=0xYOUR_WALLET corepack pnpm snapshot:wallet
```

2. Build du merkle tree:
```bash
SNAPSHOT_FILE=snapshots/snapshot-uREKT-55210000.json corepack pnpm merkle:build
```
Cette commande génère:
- `merkle/...-merkle.json` (root + claims)
- `merkle/...-proofs.json` (proofs indexées par adresse pour l'UI)

3. Deploy du contrat de claim:
```bash
MERKLE_FILE=merkle/snapshot-uREKT-55210000-merkle.json CLAIM_TOKEN_ADDRESS=0xNEW_TOKEN corepack pnpm claim:deploy:dogechain
```

4. Funding du contrat de claim (montant total raw):
```bash
CLAIM_FUND_AMOUNT=1000000000000000000000000 corepack pnpm claim:fund:dogechain
```

5. Sync UI (inclut l'adresse claim):
```bash
corepack pnpm ui:sync:dogechain
```

Ensuite les users peuvent claim via le bloc Claim en haut de la page Swap.
Si `claimProofsFile` est présent, l'UI auto-remplit montant + proof pour l'adresse connectée.

## Notes importantes

- Ce code est un fork de composants Uniswap V2 et doit respecter les licences des projets upstream.
- Le fork de contrats seul ne suffit pas pour la prod: il faut audit, monitoring, gestion des clés, plan d'upgrade, et tests d'intégration.
- La première compilation Hardhat télécharge les compilateurs Solidity `0.5.16` et `0.6.6`; une connexion internet est nécessaire à cette étape.
