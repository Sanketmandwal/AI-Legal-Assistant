// src/services/lawyerMatchingService.js
export const getRelevantSpecializationsFromFIR = (fir) => {
  const text = [
    fir?.incident?.category || "",
    fir?.incident?.title || "",
    fir?.incident?.description || "",
  ]
    .join(" ")
    .toLowerCase();

  const tags = new Set();

  if (text.includes("theft") || text.includes("stolen") || text.includes("robbery")) {
    tags.add("criminal");
    tags.add("cyber crime");
  }

  if (text.includes("assault") || text.includes("violence") || text.includes("attack")) {
    tags.add("criminal");
  }

  if (text.includes("domestic")) {
    tags.add("family law");
    tags.add("criminal");
  }

  if (text.includes("fraud") || text.includes("scam") || text.includes("cheating")) {
    tags.add("criminal");
    tags.add("cyber crime");
  }

  if (text.includes("property") || text.includes("land")) {
    tags.add("property law");
  }

  if (tags.size === 0) {
    tags.add("criminal");
  }

  return [...tags];
};
