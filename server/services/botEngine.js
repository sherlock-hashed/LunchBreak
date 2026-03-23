/**
 * Bot Engine — ELO-based bot behavior with realistic timing and accuracy
 */

const BOT_NAMES = [
  "CSClash_Bot", "Kernel_King", "Deadlock_Daemon", "Cache_Master", "Query_Queen",
  "Stack_Sentinel", "Mutex_Mind", "Pipe_Phantom", "Byte_Baron", "Thread_Titan",
  "Algo_Oracle", "Logic_Lynx", "Socket_Sage", "Heap_Hawk", "Node_Ninja",
];

/**
 * Get bot config based on player ELO
 */
const getBotConfig = (playerElo) => {
  if (playerElo >= 2000) return { accuracy: 0.88, avgResponseMs: 1500, variation: 0.30 };
  if (playerElo >= 1600) return { accuracy: 0.80, avgResponseMs: 2000, variation: 0.30 };
  if (playerElo >= 1200) return { accuracy: 0.70, avgResponseMs: 2500, variation: 0.30 };
  return { accuracy: 0.60, avgResponseMs: 3000, variation: 0.30 };
};

/**
 * Generate a random bot name
 */
const getRandomBotName = () => {
  return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
};

/**
 * Generate a bot ELO near the player's rating
 */
const generateBotElo = (playerElo) => {
  const offset = Math.floor(Math.random() * 200) - 100; // ±100
  return Math.max(800, playerElo + offset);
};

/**
 * Simulate bot answering a question
 * @returns {{ isCorrect: boolean, delayMs: number, optionIdx: number }}
 */
const simulateBotAnswer = (question, playerElo) => {
  const config = getBotConfig(playerElo);
  const isCorrect = Math.random() < config.accuracy;

  // Calculate response delay with variation
  const minDelay = config.avgResponseMs * (1 - config.variation);
  const maxDelay = config.avgResponseMs * (1 + config.variation);
  const delayMs = Math.floor(minDelay + Math.random() * (maxDelay - minDelay));

  let optionIdx;
  if (isCorrect) {
    optionIdx = question.correct;
  } else {
    // Pick a random wrong answer
    const wrongOptions = [0, 1, 2, 3].filter(i => i !== question.correct);
    optionIdx = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
  }

  return { isCorrect, delayMs, optionIdx };
};

module.exports = { getBotConfig, getRandomBotName, generateBotElo, simulateBotAnswer, BOT_NAMES };
