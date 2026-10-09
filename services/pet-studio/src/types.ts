export const petStyles = ["pixel", "storybook", "plush"] as const;
export type PetStyle = typeof petStyles[number];
export const petJobStates = ["queued", "processing", "awaiting_model", "succeeded", "failed"] as const;
export type PetJobState = typeof petJobStates[number];

export type PetJob = {
  id: string;
  state: PetJobState;
  style: PetStyle;
  sourceMime: "image/jpeg" | "image/png" | "image/webp";
  sourceFilename: string;
  createdAt: string;
  updatedAt: string;
  message: string;
  previewUrl?: string;
  bundleUrl?: string;
  errorCode?: string;
};
