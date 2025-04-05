const { configForAddress, chainData } = require("@reality.eth/contracts");
import {
  Question,
  QuestionPhase,
  Chain,
  Contract,
  ContractConfig,
} from "./types/questions";

// Constants
const BATCH_SIZE = 1000;
const ANSWERED_TOO_SOON =
  "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe";
const INVALID_ANSWER =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export interface ChainInfo {
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

export interface QuestionFilters {
  searchTerm?: string;
  arbitrator?: string;
  phase?: QuestionPhase;
  lastCreatedTimestamp?: number;
  batchSize?: number;
  questionId?: string;
  contract?: string;
  data?: string;
  minBond?: string;
  qType?: string;
  bounty?: string;
  currentAnswer?: string;
  currentAnswerBond?: string;
  openingTimestamp?: number;
  currentScheduledFinalizationTimestamp?: number;
  answerFinalizedTimestamp?: number;
  isPendingArbitration?: boolean;
  arbitrationRequestedBy?: string;
  user?: string;
  templateId?: string;
}

export interface QuestionProgress {
  total: number;
  processed: number;
  failed: number;
  lastTimestamp?: number;
}

export function getChainInfo(chainId: number): ChainInfo {
  const info = chainData(chainId);
  if (!info) {
    throw new Error(`Chain ${chainId} not found`);
  }
  return info;
}

export async function retrieveQuestions(
  chainId: number,
  filters: QuestionFilters = {},
  onProgress?: (progress: QuestionProgress) => void
): Promise<Question[]> {
  const chainInfo = getChainInfo(chainId);
  if (!chainInfo.graphURL) {
    throw new Error(`No subgraph URL found for chain ${chainId}`);
  }

  const processedQuestions: Question[] = [];
  let lastTimestamp: number | undefined = filters.lastCreatedTimestamp;
  let hasMore = true;
  let totalProcessed = 0;
  let totalFailed = 0;
  const batchSize = filters.batchSize || 1000;

  while (hasMore) {
    const query = buildQuery({
      ...filters,
      lastCreatedTimestamp: lastTimestamp,
      batchSize,
    });

    const response = await fetch(chainInfo.graphURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(
        `Network error: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();
    if (json.errors) {
      throw new Error("GraphQL errors: " + JSON.stringify(json.errors));
    }

    const chain: Chain = {
      id: chainId,
      name: chainInfo.chainName,
      subgraphUrl: chainInfo.graphURL,
    };

    const questions = json.data.questions;
    if (questions.length === 0) {
      hasMore = false;
      break;
    }

    // Process questions in smaller batches for better progress tracking
    const processBatchSize = 10;
    for (let i = 0; i < questions.length; i += processBatchSize) {
      const batch = questions.slice(i, i + processBatchSize);

      // Process each batch in parallel
      const batchPromises = batch.map(async (q: any) => {
        try {
          const processedQuestion = transformQuestion(q, chain);
          totalProcessed++;
          if (onProgress) {
            onProgress({
              total: totalProcessed + totalFailed,
              processed: totalProcessed,
              failed: totalFailed,
              lastTimestamp: parseInt(q.createdTimestamp),
            });
          }
          return processedQuestion;
        } catch (err) {
          console.error(`Error processing question ${q.id}:`, err);
          totalFailed++;
          if (onProgress) {
            onProgress({
              total: totalProcessed + totalFailed,
              processed: totalProcessed,
              failed: totalFailed,
              lastTimestamp: parseInt(q.createdTimestamp),
            });
          }
          return null;
        }
      });

      // Wait for the current batch to complete
      const batchResults = await Promise.all(batchPromises);
      processedQuestions.push(
        ...(batchResults.filter((q) => q !== null) as Question[])
      );
    }

    // Update lastTimestamp for next batch
    lastTimestamp = parseInt(questions[questions.length - 1].createdTimestamp);

    // If we got fewer results than requested, we've reached the end
    if (questions.length < batchSize) {
      hasMore = false;
    }
  }

  return processedQuestions;
}

function buildQuery(filters: QuestionFilters & { batchSize?: number }): string {
  const whereConditions = [];

  if (filters.searchTerm?.trim()) {
    whereConditions.push(
      `data_contains_nocase: "${filters.searchTerm.trim()}"`
    );
  }

  if (filters.arbitrator) {
    whereConditions.push(`arbitrator: "${filters.arbitrator.toLowerCase()}"`);
  }

  if (filters.questionId) {
    whereConditions.push(`questionId: "${filters.questionId}"`);
  }

  if (filters.contract) {
    whereConditions.push(`contract: "${filters.contract.toLowerCase()}"`);
  }

  if (filters.minBond) {
    whereConditions.push(`minBond: "${filters.minBond}"`);
  }

  if (filters.qType) {
    whereConditions.push(`qType: "${filters.qType}"`);
  }

  if (filters.bounty) {
    whereConditions.push(`bounty: "${filters.bounty}"`);
  }

  if (filters.currentAnswer) {
    whereConditions.push(`currentAnswer: "${filters.currentAnswer}"`);
  }

  if (filters.currentAnswerBond) {
    whereConditions.push(`currentAnswerBond: "${filters.currentAnswerBond}"`);
  }

  if (filters.openingTimestamp) {
    whereConditions.push(`openingTimestamp: ${filters.openingTimestamp}`);
  }

  if (filters.currentScheduledFinalizationTimestamp) {
    whereConditions.push(
      `currentScheduledFinalizationTimestamp: ${filters.currentScheduledFinalizationTimestamp}`
    );
  }

  if (filters.answerFinalizedTimestamp) {
    whereConditions.push(
      `answerFinalizedTimestamp: ${filters.answerFinalizedTimestamp}`
    );
  }

  if (filters.isPendingArbitration !== undefined) {
    whereConditions.push(
      `isPendingArbitration: ${filters.isPendingArbitration}`
    );
  }

  if (filters.arbitrationRequestedBy) {
    whereConditions.push(
      `arbitrationRequestedBy: "${filters.arbitrationRequestedBy.toLowerCase()}"`
    );
  }

  if (filters.user) {
    whereConditions.push(`user: "${filters.user.toLowerCase()}"`);
  }

  if (filters.templateId) {
    whereConditions.push(`template_: { templateId: "${filters.templateId}" }`);
  }

  if (filters.lastCreatedTimestamp) {
    whereConditions.push(
      `createdTimestamp_lt: ${filters.lastCreatedTimestamp}`
    );
  }

  const whereClause =
    whereConditions.length > 0
      ? `where: { ${whereConditions.join(", ")} }`
      : "";

  return `
    query GetQuestions {
      questions(
        orderBy: createdTimestamp
        orderDirection: desc
        first: ${filters.batchSize || BATCH_SIZE}
        ${whereClause}
      ) {
        id
        questionId
        arbitrator
        data
        minBond
        user
        contract
        createdTimestamp
        timeout
        qType
        bounty
        currentAnswer
        currentAnswerBond
        template {
          id
          user
          templateId
          questionText
        }
        openingTimestamp
        currentScheduledFinalizationTimestamp
        answerFinalizedTimestamp
        isPendingArbitration
        arbitrationRequestedBy
        responses (orderBy: timestamp) {
          id
          answer
          bond
          user
          timestamp
        }
        answers(orderBy: timestamp) {
          id
          answer
          lastBond
          timestamp
        }
      }
    }
  `;
}

function transformQuestion(q: any, chain: Chain): Question {
  const parsedData = parseQuestionData(q.data, q.qType, q.template);
  const phase = determineQuestionPhase(q);
  const contractConfig = configForAddress(q.contract);

  return {
    id: q.questionId,
    title: parsedData.title,
    description: parsedData.description || "No description available",
    options: parsedData.options || [],
    arbitrator: q.arbitrator,
    contract: {
      address: q.contract,
      config: contractConfig || {
        address: q.contract,
        arbitrators: [],
        version_number: "unknown",
        chain_id: chain.id.toString(),
        contract_name: "Unknown",
        contract_version: "Unknown",
        token_ticker: "ETH",
      },
    },
    chain,
    phase,
    qType: q.qType,
    currentAnswer: q.currentAnswer,
    currentBond: q.currentAnswerBond || q.bounty,
    minimumBond: q.minBond,
    timeRemaining: calculateTimeRemaining(q),
    timeToOpen: calculateTimeToOpen(q),
    createdTimestamp: parseInt(q.createdTimestamp),
    openingTimestamp: parseInt(q.openingTimestamp),
    arbitrationRequestedBy: q.arbitrationRequestedBy,
    currentScheduledFinalizationTimestamp:
      q.currentScheduledFinalizationTimestamp,
    answers: transformAnswers(q.answers),
    responses: transformResponses(q.responses),
    finalAnswer:
      phase === QuestionPhase.FINALIZED
        ? parseAnswer(q.currentAnswer)
        : undefined,
    template: q.template
      ? {
          templateId: q.template.templateId,
          questionText: q.template.questionText,
          creationTimestamp: q.template.creationTimestamp,
          creator: q.template.creator,
        }
      : undefined,
    data: q.data,
  };
}

function parseQuestionData(
  data: string,
  qType: string,
  template?: { questionText: string }
) {
  try {
    if (template?.questionText) {
      const dataValues = data.split("␟");
      let valueIndex = 0;
      const unescapedTemplate = template.questionText;
      const completedTemplate = unescapedTemplate.replace(/%s/g, () => {
        const value = dataValues[valueIndex];
        valueIndex++;
        return value || "";
      });

      try {
        const questionData = JSON.parse(completedTemplate);
        const options =
          questionData.type === "single-select" && questionData.outcomes
            ? Array.isArray(questionData.outcomes)
              ? questionData.outcomes
              : questionData.outcomes
                  .split(",")
                  .map((opt: string) => opt.trim())
            : questionData.type === "bool"
              ? ["No", "Yes"]
              : [];

        return {
          title: questionData.title,
          options,
          description:
            questionData.description || "Please select one of the options",
          category: questionData.category,
        };
      } catch (parseError) {
        console.error("Failed to parse template:", parseError);
        return defaultQuestionData(data);
      }
    }

    const [title, optionsStr, category] = data.split("␟");
    const options =
      qType === "single-select"
        ? optionsStr
            .match(/(?:[^,"]|"(?:[^"])*")+/g)
            ?.map((opt) => opt.trim().replace(/^"|"$/g, "").trim()) || []
        : [];

    return {
      title,
      options,
      description: "Please select one of the options",
      category,
    };
  } catch (error) {
    console.error("Error parsing question data:", error);
    return defaultQuestionData(data);
  }
}

function defaultQuestionData(data: string) {
  return {
    title: data,
    options: [],
    description: "Please select one of the options",
    category: "Unknown",
  };
}

function determineQuestionPhase(q: any): QuestionPhase {
  const now = Math.floor(Date.now() / 1000);
  const timeout = parseInt(q.timeout);
  const finalizedTime = parseInt(q.answerFinalizedTimestamp);
  const openingTime = parseInt(q.openingTimestamp);

  if (timeout === 0) return QuestionPhase.NOT_CREATED;
  if (q.isPendingArbitration) return QuestionPhase.PENDING_ARBITRATION;
  if (finalizedTime !== 0 && finalizedTime <= now)
    return QuestionPhase.FINALIZED;
  if (openingTime > now) return QuestionPhase.UPCOMING;
  return QuestionPhase.OPEN;
}

function calculateTimeRemaining(q: any): number {
  const now = Math.floor(Date.now() / 1000);
  const finalizationTime = q.currentScheduledFinalizationTimestamp
    ? parseInt(q.currentScheduledFinalizationTimestamp)
    : 0;
  return finalizationTime && finalizationTime > now
    ? (finalizationTime - now) * 1000
    : 0;
}

function calculateTimeToOpen(q: any): number {
  const now = Math.floor(Date.now() / 1000);
  const openingTime = parseInt(q.openingTimestamp);
  return openingTime && openingTime > now ? (openingTime - now) * 1000 : 0;
}

function parseAnswer(answerHex: string): string {
  if (answerHex === ANSWERED_TOO_SOON) return "Answered Too Soon";
  if (answerHex === INVALID_ANSWER) return "Invalid Answer";
  return answerHex;
}

function transformAnswers(answers: any[]): Question["answers"] {
  return answers.map((a) => ({
    value: parseAnswer(a.answer),
    bond: a.lastBond,
    timestamp: parseInt(a.timestamp) * 1000,
  }));
}

function transformResponses(responses: any[]): Question["responses"] {
  return responses.map((r) => ({
    value: parseAnswer(r.answer),
    timestamp: parseInt(r.timestamp) * 1000,
    bond: r.bond,
    user: r.user,
  }));
}

export type { Question, QuestionPhase, Chain } from "./types/questions";
