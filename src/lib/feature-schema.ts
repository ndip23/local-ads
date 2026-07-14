// For MongoDB migration, runtime SQL schema setup is unnecessary.
export async function ensureReferralFeatureSchema() {
  return Promise.resolve();
}

export async function ensureCampaignCoreSchema() {
  return Promise.resolve();
}

export async function ensureCampaignWorkflowSchema() {
  return Promise.resolve();
}
