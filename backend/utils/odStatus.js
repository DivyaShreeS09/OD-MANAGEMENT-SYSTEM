function computeFinalStatus(approvals) {
  if (Object.values(approvals).includes("rejected")) return "rejected";

  const coordinatorApproved =
    approvals.classCoord === "approved" ||
    approvals.yearCoord === "approved";

  if (coordinatorApproved && approvals.hod === "approved") return "approved";

  return "pending";
}

module.exports = computeFinalStatus;
