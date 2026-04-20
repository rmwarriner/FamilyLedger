import { invoke } from '@tauri-apps/api/core';

export interface PairingBundle {
  privateKeyHex: string;
  publicKeyHex: string;
}

export interface PairingSharedSecret {
  sharedSecretHex: string;
}

export interface CompletePairingRequest {
  privateKeyHex: string;
  peerPublicKeyHex: string;
}

export const beginPairing = async (): Promise<PairingBundle> =>
  invoke<PairingBundle>('begin_pairing');

export const completePairing = async (request: CompletePairingRequest): Promise<PairingSharedSecret> =>
  invoke<PairingSharedSecret>('complete_pairing', { request });
