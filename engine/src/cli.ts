import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import type { GameState, MoveResult, Player } from './types';
import { applyMove } from './applyMove';
import { createGame } from './createGame';
import { getWinner } from './status';
import { isLegal, legalMoves } from './legalMoves';

function renderBoard(state: GameState): string {
  const pit = (index: number): string => {
    const count = state.pits[index] ?? 0;
    return `${String(index).padStart(2, ' ')}:${String(count).padStart(2, ' ')}`;
  };

  const top = [11, 10, 9, 8, 7, 6].map(pit).join(' ');
  const bottom = [0, 1, 2, 3, 4, 5].map(pit).join(' ');
  const topTurn = state.turn === 1 ? '  <-- turn' : '';
  const bottomTurn = state.turn === 0 ? '  <-- turn' : '';

  return [
    '',
    `          Player 1${topTurn}`,
    `  [S1 ${String(state.stores[1]).padStart(2, ' ')}]  ${top}`,
    `               ${bottom}  [S0 ${String(state.stores[0]).padStart(2, ' ')}]`,
    `          Player 0${bottomTurn}`,
    '',
  ].join('\n');
}

function printMoveSummary(result: MoveResult): void {
  const summary = [`${result.steps.length} seeds sown`];
  if (result.captured > 0) summary.push(`captured ${result.captured}`);
  if (result.extraTurn) summary.push('extra turn');
  console.log(`  Sowing path: ${result.steps.map((step) => step.slot).join(' > ')}`);
  console.log(`  ${summary.join(', ')}.`);
}

function playerLabel(player: Player, versusComputer: boolean): string {
  if (versusComputer) return player === 0 ? 'Player' : 'Computer';
  return player === 0 ? 'Player 1' : 'Player 2';
}

async function askForMove(
  readline: ReturnType<typeof createInterface>,
  state: GameState,
): Promise<number | null> {
  while (true) {
    const options = legalMoves(state).join(', ');
    const answer = await readline.question(`  Your move (${options}, q to quit): `);
    const trimmed = answer.trim().toLowerCase();

    if (trimmed === 'q' || trimmed === 'quit') return null;

    const pit = Number.parseInt(trimmed, 10);
    if (!Number.isInteger(pit)) {
      console.log('  Please enter a pit number.');
      continue;
    }
    if (!isLegal(state, pit)) {
      console.log('  That pit is not a legal move.');
      continue;
    }
    return pit;
  }
}

function chooseBotMove(state: GameState): number {
  const moves = legalMoves(state);
  if (moves.length === 0) {
    throw new Error('The computer has no legal moves');
  }
  const index = Math.floor(Math.random() * moves.length);
  return moves[index] ?? moves[0] ?? 0;
}

function printResult(state: GameState, versusComputer: boolean): void {
  const winner = getWinner(state);
  const player0 = playerLabel(0, versusComputer);
  const player1 = playerLabel(1, versusComputer);
  const totalSeeds =
    state.pits.reduce((sum, count) => sum + count, 0) + state.stores[0] + state.stores[1];

  console.log(
    `Final score: ${player0} ${state.stores[0]} - ${state.stores[1]} ${player1}`,
  );
  console.log(`Seed check: ${totalSeeds} (expected 48).`);

  if (winner === 'draw') {
    console.log('It is a draw.');
  } else if (winner === 0) {
    console.log(`${player0} wins.`);
  } else {
    console.log(`${player1} wins.`);
  }
}

async function main(): Promise<void> {
  const readline = createInterface({ input, output });

  try {
    console.log('Gebeta terminal demo');
    const modeAnswer = (
      await readline.question('Mode: 1 = two players, 2 = vs computer [1]: ')
    ).trim();
    const versusComputer = modeAnswer === '2';

    let state = createGame();

    while (!state.over) {
      console.log(renderBoard(state));
      const label = playerLabel(state.turn, versusComputer);
      let pit: number | null;

      if (versusComputer && state.turn === 1) {
        pit = chooseBotMove(state);
        console.log(`  ${label} plays pit ${pit}.`);
      } else {
        console.log(`  ${label}'s turn.`);
        pit = await askForMove(readline, state);
      }

      if (pit === null) {
        console.log('Game abandoned.');
        return;
      }

      const result = applyMove(state, pit);
      state = result.state;
      printMoveSummary(result);
    }

    console.log(renderBoard(state));
    printResult(state, versusComputer);
  } finally {
    readline.close();
  }
}

main().catch((error: unknown) => {
  console.error('Gebeta CLI failed:', error);
  process.exitCode = 1;
});
