import type { GameState, Player } from './types';

/**
 * Shared socket event names used by both the app and the server.
 */
export const EVENTS = {
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  MAKE_MOVE: 'make_move',
  RESIGN: 'resign',
  RESUME_ROOM: 'resume_room',

  ROOM_CREATED: 'room_created',
  ROOM_JOINED: 'room_joined',
  STATE_UPDATE: 'state_update',
  OPPONENT_STATUS: 'opponent_status',
  GAME_OVER: 'game_over',
  ERROR: 'error',
} as const;

/**
 * Error codes shared across the REST and socket protocols.
 */
export const ERROR_CODES = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  ILLEGAL_MOVE: 'ILLEGAL_MOVE',
  STALE_SEQ: 'STALE_SEQ',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface PublicProfile {
  readonly id: string;
  readonly username: string;
  readonly rating: number;
}

export interface CreateRoomPayload {
  readonly rulesId?: string;
}

export interface JoinRoomPayload {
  readonly code: string;
}

export interface MakeMovePayload {
  readonly code: string;
  readonly pit: number;
  readonly seq: number;
}

export interface ResignPayload {
  readonly code: string;
}

export interface ResumeRoomPayload {
  readonly code: string;
}

export interface RoomCreatedPayload {
  readonly code: string;
}

export interface RoomJoinedPayload {
  readonly code: string;
  readonly you: Player;
  readonly opponent: PublicProfile;
  readonly state: GameState;
  readonly seq: number;
  readonly deadlineAt: number;
}

export interface StateUpdatePayload {
  readonly seq: number;
  readonly move: {
    readonly by: Player;
    readonly pit: number;
  };
  readonly state: GameState;
  readonly deadlineAt: number;
}

export interface OpponentStatusPayload {
  readonly connected: boolean;
}

export interface GameOverPayload {
  readonly winner: Player | 'draw';
  readonly state: GameState;
  readonly reason: 'finished' | 'resign' | 'timeout' | 'abandoned';
  readonly ratingDelta?: number;
}

export interface ProtocolErrorPayload {
  readonly code: ErrorCode;
  readonly message: string;
}
