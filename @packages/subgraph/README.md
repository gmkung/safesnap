# @kleroos/subgraph

A utility package for interacting with RealityETH subgraphs.

## Installation

```bash
npm install @kleroos/subgraph
# or
yarn add @kleroos/subgraph
```

## Usage

### Get Chain Information

```typescript
import { getChainInfo } from "@kleroos/subgraph";

// Get chain info for Ethereum mainnet (chain ID 1)
const chainInfo = getChainInfo(1);
console.log(chainInfo.graphURL); // The Graph subgraph URL
```

### Retrieve Questions

```typescript
import { retrieveQuestions, QuestionPhase } from "@kleroos/subgraph";

// Get all questions from Ethereum mainnet
const questions = await retrieveQuestions(1);

// Get questions with filters
const filteredQuestions = await retrieveQuestions(1, {
  searchTerm: "climate",
  arbitrator: "0x...",
  phase: QuestionPhase.OPEN,
  lastCreatedTimestamp: 1234567890,
});

// Get questions with progress tracking
const questions = await retrieveQuestions(1, {}, (progress) => {
  console.log(`Processed ${progress.processed} of ${progress.total} questions`);
  console.log(`Failed: ${progress.failed}`);
  console.log(`Last timestamp: ${progress.lastTimestamp}`);
});
```

### Progressive Loading

The package implements a two-level batching system for efficient data retrieval and processing:

1. **Outer Batch (API Level)**
   - Controls how many questions to fetch from the GraphQL API in a single request
   - Default size: 1000 questions per API call
   - Configurable via `batchSize` parameter

2. **Inner Batch (Processing Level)**
   - Controls how many questions to process in memory simultaneously
   - Fixed size: 10 questions per processing batch
   - Enables parallel processing and detailed progress tracking

This architecture provides:
- Efficient network usage (fewer API calls)
- Controlled memory usage (processing in smaller chunks)
- Parallel processing benefits
- Detailed progress tracking

## Types

### ChainInfo

```typescript
interface ChainInfo {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  network_name: string;
  rpcUrls: string[];
  hostedRPC: string;
  graphURL?: string;
  blockExplorerUrls: string[];
  deprecated?: boolean;
  atprotoBot?: string;
}
```

### Question

```typescript
interface Question {
  id: string;
  title: string;
  description: string;
  options: string[];
  arbitrator: string;
  contract: string;
  chain: Chain;
  phase: QuestionPhase;
  qType: string;
  currentAnswer: string;
  currentBond: string;
  minimumBond: string;
  timeRemaining: number;
  timeToOpen: number;
  createdTimestamp: number;
  openingTimestamp: number;
  arbitrationRequestedBy?: string;
  currentScheduledFinalizationTimestamp?: string;
  answers: Answer[];
  responses: Response[];
  finalAnswer?: string;
  template?: Template;
}
```

### QuestionPhase

```typescript
enum QuestionPhase {
  NOT_CREATED = "NOT_CREATED",
  UPCOMING = "UPCOMING",
  OPEN = "OPEN",
  PENDING_ARBITRATION = "PENDING_ARBITRATION",
  FINALIZED = "FINALIZED",
}
```

### QuestionProgress

```typescript
interface QuestionProgress {
  total: number;      // Total number of questions processed
  processed: number;  // Number of successfully processed questions
  failed: number;     // Number of failed questions
  lastTimestamp?: number; // Timestamp of the last processed question
}
```

## License

MIT
