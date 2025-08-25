#!/usr/bin/env bash
# Shared Prisma schema definitions
PRISMA_RELATIONAL_SCHEMAS=(core auth cmdb integration notification user360)
PRISMA_MONGO_SCHEMAS=(audit)
PRISMA_ALL_SCHEMAS=("${PRISMA_RELATIONAL_SCHEMAS[@]}" "${PRISMA_MONGO_SCHEMAS[@]}")
