-- CreateIndex
CREATE INDEX "CreditTransaction_orgId_createdAt_idx" ON "CreditTransaction"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditTransaction_orgId_type_idx" ON "CreditTransaction"("orgId", "type");

-- CreateIndex
CREATE INDEX "Export_projectId_status_idx" ON "Export"("projectId", "status");

-- CreateIndex
CREATE INDEX "Export_createdAt_idx" ON "Export"("createdAt");

-- CreateIndex
CREATE INDEX "Moment_projectId_idx" ON "Moment"("projectId");

-- CreateIndex
CREATE INDEX "Moment_projectId_score_idx" ON "Moment"("projectId", "score");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "Project_orgId_status_idx" ON "Project"("orgId", "status");

-- CreateIndex
CREATE INDEX "Project_orgId_createdAt_idx" ON "Project"("orgId", "createdAt");
