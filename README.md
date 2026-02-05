# One-Click Gasless Token Swap DApp

A one-pager DApp for **gasless token swaps** using **ERC-4337** (Account Abstraction) and **EIP-7702**, with a Next.js 15 frontend, Express backend for Alchemy RPC (Bundler + Gas Manager), and MongoDB for users and swap history.

## Structure

- **`/frontend`** – Next.js 15 (App Router) + TypeScript, wagmi/viem, Alchemy aa-sdk. Connect modal (MetaMask + social), swap form, Go Premium modal. Inter font, minimal UI (off-white, deep purple, vibrant purple accents).
- **`/backend`** – Express + TypeScript, MVC. Auth (social login), RPC layer for Alchemy Bundler and Gas Manager, tier-based policies, MongoDB (User, Wallet, Swap).

## Features

- **Gasless swaps:** Paymaster (Alchemy Gas Manager) sponsors gas; users sign UserOps, no ETH required.
- **Connect:** MetaMask (EOA) or social login (smart account via aa-sdk).
- **Tiers:** FREE (limited gas), PRO (higher limits), MASTER (AI agent, lower fees). Go Premium modal and backend policy selection.
- **Stack:** aa-sdk, ethers, wagmi, viem; permissionless.js optional for advanced AA.

## Quick start

### Backend

```bash
cd backend
cp .env.example .env   # set MONGODB_URI, ALCHEMY_API_KEY, GAS_MANAGER_POLICY_IDS, JWT_SECRET
npm install
npm run build
npm start
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

### Presentation PDF

```bash
cd presentation
npm install
npm run build:pdf
# Output: presentation/output/Gasless-Swap-Presentation.pdf
```

## Architecture (high level)

1. User connects via frontend (MetaMask or social).
2. Backend handles auth, stores user/wallet in MongoDB, returns tier.
3. Swap: frontend builds UserOp (or gets calldata from backend); backend returns paymaster data for user tier and submits UserOp via Alchemy Bundler.
4. EntryPoint validates and runs; smart account executes DEX router call → swap.

See `/presentation` and the plan in `.cursor/plans/` for full architecture and business rationale.

---

## Gasless swap implementation (what was built)

End-to-end flow: **user signs UserOperation in MetaMask** → **backend talks to Alchemy (paymaster + bundler)** → **EntryPoint + smart account** → **DEX router swap**.

### Backend

| File | Role |
|------|------|
| `backend/src/controllers/authController.ts` | **Wallet sign-in:** `walletSignIn` verifies EOA signature (viem `verifyMessage`), finds or creates user (`email = address@wallet.local`), links wallet, returns JWT. |
| `backend/src/routes/auth.ts` | `POST /api/auth/wallet-signin` – body: `{ address, signature, message }`. |
| `backend/src/services/alchemyGasManager.ts` | **Paymaster:** calls Alchemy Gas Manager `alchemy_requestGasAndPaymasterAndData` with policy by user tier (FREE/PRO/MASTER). |
| `backend/src/services/alchemyBundler.ts` | **Bundler:** calls Alchemy `eth_sendUserOperation` with EntryPoint v0.6. |
| `backend/src/controllers/rpcController.ts` | **RPC:** `paymasterData` (auth + paymaster), `sendUserOp` (auth + bundler), `submit7702` (auth + relayer Type 4 tx). All require JWT. |
| `backend/src/services/submit7702.ts` | **EIP-7702:** viem relayer wallet; sends Type 4 tx with `authorizationList`, `to` = user EOA, `data` = delegator calldata. |

### Frontend

| File | Role |
|------|------|
| `frontend/src/lib/constants.ts` | EntryPoint v0.6, Uniswap V2 router and token addresses per chain (mainnet + Sepolia). |
| `frontend/src/lib/dex.ts` | **DEX:** encodes Uniswap V2 `swapExactTokensForTokens` (path, amounts, deadline) for the smart account `execute(router, 0, calldata)`. |
| `frontend/src/lib/smartAccount.ts` | **Smart account:** `WalletClientSigner` from wagmi/viem (MetaMask), `createModularAccountAlchemyClient` (Alchemy aa-sdk) for Sepolia. |
| `frontend/src/lib/gaslessSwap.ts` | **ERC-4337 flow:** (1) build UserOp with `buildUserOperation` (call = router swap), (2) get `paymasterAndData` from backend, (3) merge and sign with `client.signUserOperation`, (4) send signed UserOp to backend, (5) record swap via `swapsApi.create`. |
| `frontend/src/lib/gaslessSwap7702.ts` | **EIP-7702 flow:** (1) prepare + sign EIP-7702 authorization (EOA → delegator contract), (2) encode delegator `executeSwap` calldata, (3) send signed auth + calldata to backend `POST /api/rpc/submit-7702`, (4) relayer submits Type 4 tx; record swap with `txHash`. |
| `frontend/src/lib/api.ts` | `authApi.walletSignIn`, `rpcApi.paymasterData`, `rpcApi.sendUserOp`, `rpcApi.submit7702`, `swapsApi.create`. |
| `frontend/src/components/SwapForm.tsx` | On **Swap** click: ensure JWT; if `NEXT_PUBLIC_USE_EIP7702=true` run `runGaslessSwap7702`, else create smart account and run `runGaslessSwap`; show modal (complete with `userOpHash` or `txHash` or error). |
| `frontend/src/components/SwapStatusModal.tsx` | Modal states: `confirm` (dummy), `processing` (spinner), `complete` (real `userOpHash` or `txHash` or error). |

### Flow in short

1. User connects MetaMask (wagmi).
2. User clicks **Swap** → if no JWT, frontend prompts sign-in (sign message → `POST /api/auth/wallet-signin` → store token).
3. Frontend creates Alchemy modular smart account client (owner = MetaMask via `WalletClientSigner`).
4. Frontend builds UserOp: smart account `execute(Uniswap V2 Router, 0, swapExactTokensForTokens(...))`.
5. Frontend requests paymaster from backend `POST /api/rpc/paymaster-data` (JWT + userOp).
6. Frontend merges `paymasterAndData`, signs UserOp with `client.signUserOperation`, sends to backend `POST /api/rpc/send-userop`.
7. Backend calls Alchemy Bundler `eth_sendUserOperation`; paymaster sponsors gas; EntryPoint runs smart account → DEX swap.
8. Frontend records swap via `POST /api/swaps` and shows `userOpHash` in the modal.

### EIP-7702 (optional)

When `NEXT_PUBLIC_USE_EIP7702=true` and a delegator contract address is set (`NEXT_PUBLIC_DELEGATOR_CONTRACT_ADDRESS` or in `constants.ts`), the app uses the **EIP-7702** flow: user signs an authorization (EOA → delegator), frontend sends signed auth + delegator calldata to `POST /api/rpc/submit-7702`; backend relayer submits a **Type 4** transaction (relayer pays gas). See `presentation/KEY_TECHNICAL_DECISIONS.md` for flows and trade-offs.

### Env

- **Backend:** `ALCHEMY_API_KEY`, `GAS_MANAGER_POLICY_ID_FREE` (and optionally PRO/MASTER), `MONGODB_URI`, `JWT_SECRET`. For EIP-7702: `RELAYER_PRIVATE_KEY`.
- **Frontend:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ALCHEMY_API_KEY` (for smart account + bundler). For EIP-7702: `NEXT_PUBLIC_USE_EIP7702`, `NEXT_PUBLIC_DELEGATOR_CONTRACT_ADDRESS`.
