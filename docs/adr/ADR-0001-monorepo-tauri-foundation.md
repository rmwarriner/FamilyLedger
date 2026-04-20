# ADR-0001: Monorepo + Tauri v2 Foundation

- Status: Accepted
- Date: 2026-04-20
- Deciders: @rmwarriner

## Context
FamilyLedger needs a lightweight cross-platform desktop foundation with strong local performance, typed boundaries, and secure local data handling.

## Decision
Use a monorepo with Tauri v2 Rust backend and TypeScript frontend/packages, with strict typing and modular domain packages.

## Consequences
- Positive: clear boundaries, strong performance potential, and platform flexibility.
- Negative: higher setup complexity than a single-package web app.
- Neutral: requires explicit CI and governance discipline.

## Alternatives Considered
- Electron monorepo
- Single-package desktop app without separated domain packages
