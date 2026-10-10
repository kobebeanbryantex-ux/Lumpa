import type { PetJobState } from "./types.js";

// Public status copy is owned by the product, not by the inference provider.
export const jobMessages: Readonly<Record<PetJobState, string>> = Object.freeze({
  queued: "Your pet is in the generation queue.",
  processing: "The private model service is creating your pet's animation assets.",
  awaiting_model: "Generation is not configured yet. No credits have been used.",
  succeeded: "Your pet's animation assets are ready.",
  failed: "The model service could not complete this request. Please try again later.",
});
