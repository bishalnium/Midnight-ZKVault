import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  setup_vault(context: __compactRuntime.CircuitContext<PS>,
              initial_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  claim_vault(context: __compactRuntime.CircuitContext<PS>,
              provided_secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type ProvableCircuits<PS> = {
  setup_vault(context: __compactRuntime.CircuitContext<PS>,
              initial_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  claim_vault(context: __compactRuntime.CircuitContext<PS>,
              provided_secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  setup_vault(context: __compactRuntime.CircuitContext<PS>,
              initial_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  claim_vault(context: __compactRuntime.CircuitContext<PS>,
              provided_secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  readonly vault_claimed: boolean;
  readonly secret_hash: Uint8Array;
  readonly total_claims: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
