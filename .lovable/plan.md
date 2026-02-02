

# Fix Address Derivation & Wallets Page Display

## Overview
This plan addresses two critical issues:
1. **Incorrect address derivation** - Only XRP addresses are correctly derived, while EVM, Solana, TRON, and Bitcoin addresses are wrong
2. **Build errors in Wallets.tsx** - Missing state variable and invalid step value
3. **Wallets page not displaying assets properly** - All crypto balances across chains should be displayed like web3 wallets

---

## Problem Analysis

### 1. Address Derivation Issues

**Current Code Problems in `src/lib/xrpDerivation.ts`:**

| Chain | Issue |
|-------|-------|
| **EVM** | Using `hdNode.derivePath("44'/60'/0'/0/0")` but `HDNodeWallet.fromPhrase()` already puts you at `m` - should just use the path without `m/` prefix which is done correctly, BUT Solana derivation is using ethers which is wrong |
| **Solana** | Using ethers.js to derive ed25519 keys - completely wrong! Solana uses ed25519 derivation, ethers uses secp256k1 |
| **TRON** | Creating fake addresses instead of proper base58check encoding. TRON addresses should start with 'T' and use specific encoding |
| **Bitcoin** | Creating fake P2PKH addresses instead of using `bitcoinjs-lib` properly |

**Correct Derivation Methods:**
- **EVM**: ethers.js HDNodeWallet (correct approach, minor path fix)
- **Solana**: Use `ed25519-hd-key` or direct `@solana/web3.js` derivation with proper path
- **TRON**: Use bip32 + proper TRON address encoding (similar to Ethereum but with 0x41 prefix)
- **Bitcoin**: Use `bitcoinjs-lib` + `tiny-secp256k1` + `ecpair` for proper P2PKH addresses

### 2. Build Errors in Wallets.tsx

**Line 82**: `setSelectedWallet` is undefined - the state variable `selectedWallet` was never declared
**Line 253**: `'create'` is not a valid step value - only `'select' | 'import' | 'backup'` are defined

### 3. Wallets Page Display

The Wallets page should show all tokens across all chains for each imported wallet, grouped by chain like modern web3 wallets.

---

## Implementation Plan

### Step 1: Fix Build Errors (Wallets.tsx)

Add missing state variable and update step type:

```typescript
// Add state variable
const [selectedWalletConfig, setSelectedWalletConfig] = useState<typeof walletConfigs[0] | null>(null);

// Update step type to include 'create'
const [step, setStep] = useState<'select' | 'import' | 'backup' | 'create'>('select');

// Fix handleSelectWallet
const handleSelectWallet = (wallet: typeof walletConfigs[0]) => {
  setSelectedWalletConfig(wallet);
  setStep('import');
};
```

### Step 2: Fix EVM Address Derivation

The EVM derivation is mostly correct but ensure proper path handling:

```typescript
export function deriveEvmAddress(seedPhrase: string): string {
  try {
    // HDNodeWallet.fromPhrase gives us the master node at m/
    // We need to derive m/44'/60'/0'/0/0 for first account
    const hdNode = ethers.HDNodeWallet.fromPhrase(seedPhrase.trim().toLowerCase());
    const derivedWallet = hdNode.derivePath("m/44'/60'/0'/0/0");
    return derivedWallet.address;
  } catch (error) {
    console.error('Error deriving EVM address:', error);
    return '';
  }
}
```

### Step 3: Fix Solana Address Derivation

Use proper ed25519 derivation from seed:

```typescript
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';

export function deriveSolanaAddress(seedPhrase: string): string {
  try {
    const seed = bip39.mnemonicToSeedSync(seedPhrase.trim().toLowerCase());
    // Solana uses m/44'/501'/0'/0'
    const { key } = derivePath("m/44'/501'/0'/0'", seed.toString('hex'));
    const keypair = Keypair.fromSeed(key);
    return keypair.publicKey.toBase58();
  } catch (error) {
    console.error('Error deriving Solana address:', error);
    return '';
  }
}
```

**Note**: Need to install `ed25519-hd-key` package.

### Step 4: Fix TRON Address Derivation

TRON uses the same curve as Ethereum but with different address encoding:

```typescript
import { keccak256 } from 'ethers';

export function deriveTronAddress(seedPhrase: string): string {
  try {
    const hdNode = ethers.HDNodeWallet.fromPhrase(seedPhrase.trim().toLowerCase());
    // TRON uses m/44'/195'/0'/0/0
    const derivedWallet = hdNode.derivePath("m/44'/195'/0'/0/0");
    
    // Get the public key and hash it
    const publicKey = derivedWallet.publicKey;
    // Remove 0x04 prefix and keccak256 hash
    const pubKeyBytes = ethers.getBytes(publicKey).slice(1);
    const hash = ethers.keccak256(pubKeyBytes);
    
    // Take last 20 bytes, prepend 0x41 (TRON mainnet prefix)
    const addressBytes = new Uint8Array(21);
    addressBytes[0] = 0x41;
    addressBytes.set(ethers.getBytes(hash).slice(-20), 1);
    
    // Base58Check encode
    return base58CheckEncode(addressBytes);
  } catch (error) {
    console.error('Error deriving TRON address:', error);
    return '';
  }
}

function base58CheckEncode(payload: Uint8Array): string {
  // Compute double SHA256 checksum
  const hash1 = ethers.sha256(payload);
  const hash2 = ethers.sha256(hash1);
  const checksum = ethers.getBytes(hash2).slice(0, 4);
  
  // Append checksum
  const addressBytes = new Uint8Array(payload.length + 4);
  addressBytes.set(payload);
  addressBytes.set(checksum, payload.length);
  
  // Base58 encode
  return bs58.encode(addressBytes);
}
```

### Step 5: Fix Bitcoin Address Derivation

Use `bitcoinjs-lib`, `ecpair`, and `tiny-secp256k1`:

```typescript
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { BIP32Factory } from 'bip32';

const bip32 = BIP32Factory(ecc);

export function deriveBitcoinAddress(seedPhrase: string): string {
  try {
    const seed = bip39.mnemonicToSeedSync(seedPhrase.trim().toLowerCase());
    const root = bip32.fromSeed(seed);
    // BIP44 path for Bitcoin: m/44'/0'/0'/0/0
    const child = root.derivePath("m/44'/0'/0'/0/0");
    
    // Generate P2PKH address (legacy, starts with '1')
    const { address } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: bitcoin.networks.bitcoin,
    });
    
    return address || '';
  } catch (error) {
    console.error('Error deriving Bitcoin address:', error);
    return '';
  }
}
```

**Note**: Need to add `bip32` package and ensure `tiny-secp256k1` and `bitcoinjs-lib` are properly imported.

### Step 6: Update Vite Config for Additional Polyfills

Add required polyfills for crypto libraries:

```typescript
nodePolyfills({
  include: ['buffer', 'stream', 'crypto'],
  globals: { Buffer: true, process: true },
}),
```

### Step 7: Enhance Wallets Page Asset Display

Update the Wallets page to properly display all tokens grouped by chain:

```text
Wallet Card Layout:
+------------------------------------------+
| [Wallet Icon] Wallet Name                |
| XRP: rXXX...XXX    Balance: 500 XRP      |
+------------------------------------------+
| Chain: Ethereum                          |
|   ├─ 2.5 ETH ($4,500)                   |
|   └─ 1000 USDC ($1,000)                 |
+------------------------------------------+
| Chain: Polygon                           |
|   └─ 500 MATIC ($250)                   |
+------------------------------------------+
| Chain: Solana                            |
|   └─ 10 SOL ($1,500)                    |
+------------------------------------------+
| Total Value: $7,250                      |
+------------------------------------------+
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Add `ed25519-hd-key` and `bip32` packages |
| `vite.config.ts` | Extend polyfills to include `stream`, `crypto`, `process` |
| `src/lib/xrpDerivation.ts` | Complete rewrite of address derivation functions |
| `src/pages/Wallets.tsx` | Fix build errors, add missing state, fix step type |

---

## New Dependencies

```bash
npm install ed25519-hd-key bip32
```

- `ed25519-hd-key`: For proper Solana ed25519 key derivation
- `bip32`: For Bitcoin HD wallet derivation

---

## Expected Results After Fix

| Chain | Address Format | Example |
|-------|---------------|---------|
| XRP | r... (existing, works) | `rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9` |
| EVM | 0x... (42 chars) | `0x742d35Cc6634C0532925a3b844Bc9e7595f2bD` |
| Solana | Base58 (32-44 chars) | `DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy` |
| TRON | T... (34 chars) | `TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7` |
| Bitcoin | 1... (26-35 chars) | `1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2` |

---

## Testing Plan

After implementation:
1. Import a test wallet with a known seed phrase
2. Compare derived addresses against established tools like:
   - iancoleman.io/bip39 (for EVM, Bitcoin)
   - Phantom wallet (for Solana)
   - TronLink (for TRON)
3. Verify the Wallets page displays all assets across chains
4. Verify the Swap page can select tokens from any chain

