export interface Chain {
  id: number;
  name: string;
  subgraphUrl: string;
}

export interface ContractConfig {
  address: string;
  arbitrators: string[];
  version_number: string;
  chain_id: string;
  contract_name: string;
  contract_version: string;
  token_ticker: string;
}

export interface Contract {
  address: string;
  config: ContractConfig;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  options: string[];
  arbitrator: string;
  contract: Contract;
  chain: Chain;
  phase: QuestionPhase;
  qType: string;
  currentAnswer?: string;
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
  data: string;
}

export interface Answer {
  value: string;
  bond: string;
  timestamp: number;
}

export interface Response extends Answer {
  user: string;
}

export interface Template {
  templateId: string;
  questionText: string;
  creationTimestamp?: number;
  creator?: string;
}

export enum QuestionPhase {
  NOT_CREATED = "NOT_CREATED",
  UPCOMING = "UPCOMING",
  OPEN = "OPEN",
  PENDING_ARBITRATION = "PENDING_ARBITRATION",
  FINALIZED = "FINALIZED",
}

export interface QuestionProgress {
  total: number;
  processed: number;
  failed: number;
  lastTimestamp?: number;
}

export type QuestionGenerator = AsyncGenerator<Question, void, unknown>;
